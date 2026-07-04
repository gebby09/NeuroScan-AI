from fastapi import FastAPI
from fastapi import UploadFile, File
import tensorflow as tf
import numpy as np
import cv2
import base64
import uvicorn
import os
from tensorflow.keras.applications.efficientnet import preprocess_input

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
model_path = os.getenv("BRAIN_TUMOR_MODEL_PATH", "brain_tumor_efficientnetb0.keras")
img_size = (224, 224)
gradcam_layer_name = os.getenv("BRAIN_TUMOR_GRADCAM_LAYER", "top_conv")

model = tf.keras.models.load_model(model_path)

def preprocess_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    img_resized = cv2.resize(img, img_size)
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_preprocessed = preprocess_input(img_rgb.astype(np.float32))
    img_expanded = np.expand_dims(img_preprocessed, axis=0)
    
    return img_expanded, img_resized

def generate_gradcam_heatmap(img_array, model, label, confidence):
    last_conv_layer = model.get_layer(gradcam_layer_name)
    
    grad_model = tf.keras.models.Model([model.inputs], [last_conv_layer.output, model.output])
    
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, 0]  

    grads = tape.gradient(loss, conv_outputs)
    grads = tf.maximum(grads, 0)
    
    weights = tf.reduce_mean(grads, axis=(0, 1, 2))
    
    cam = np.zeros(conv_outputs.shape[1:3], dtype=np.float32)
    
    for i, w in enumerate(weights):
        cam += w * conv_outputs[0, :, :, i]
    
    cam = np.maximum(cam, 0)  
    cam = cam / (np.max(cam) + 1e-8)
    
    cam[cam < 0.6] = 0
    
    cam = cam / (np.max(cam) + 1e-8)
    
    if label == "no_tumor":
        scaling_factor = confidence * 0.3
        cam = cam * scaling_factor
    
    return cam

def overlay_heatmap_on_image(heatmap, original_img):
    heatmap = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
    
    max_val = np.max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val
    
    mask = (heatmap > 0.6).astype(np.uint8)
    heatmap = cv2.GaussianBlur(heatmap, (21, 21), 0)
    
    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    
    mask_3ch = np.stack([mask, mask, mask], axis=2)
    
    overlayed_img = np.where(
        mask_3ch == 1,
        cv2.addWeighted(original_img, 0.65, heatmap_colored, 0.35, 0),
        original_img
    ).astype(np.uint8)
    
    return overlayed_img

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img_array, original_img = preprocess_image(image_bytes)
    
    prediction = model.predict(img_array)
    prob = prediction[0][0]
    
    if prob >= 0.5:
        label = "tumor"
        confidence = prob
    else:
        label = "no_tumor"
        confidence = 1 - prob

    confidence = float(round(confidence, 4))
    prob = float(round(prob, 4))

    confidence_percent = round(confidence * 100, 2)

    if prob >= 0.5:
        heatmap = generate_gradcam_heatmap(img_array, model, label, confidence)
        overlayed_img = overlay_heatmap_on_image(heatmap, original_img)
        _, buffer = cv2.imencode('.jpg', overlayed_img)
        heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
    else:
        heatmap_base64 = None
    
    return {
    "label": label,
    "confidence": confidence,
    "confidence_percent": confidence_percent,
    "probability": prob,
    "gradcam_image": heatmap_base64
}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

 
