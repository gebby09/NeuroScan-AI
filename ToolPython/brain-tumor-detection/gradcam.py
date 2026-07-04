model_path = "brain_tumor_efficientnetb0.keras"
img_size = (224, 224)
gradcam_layer_name = "top_conv"

import tensorflow as tf
import numpy as np
import sys
import cv2
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input


if len(sys.argv) < 2:
    print("Usage: python gradcam.py <image_path>")
    sys.exit()  

model = tf.keras.models.load_model(model_path)     

img_path = sys.argv[1]
img = image.load_img(img_path, target_size=img_size)
img_array = image.img_to_array(img)
img_array = preprocess_input(img_array.astype(np.float32))
img_array = np.expand_dims(img_array, axis=0)

last_conv_layer = model.get_layer(gradcam_layer_name)

grad_model = tf.keras.models.Model([model.inputs], [last_conv_layer.output, model.output])

with tf.GradientTape() as tape:
    conv_outputs, predictions = grad_model(img_array)
    class_channel = predictions[:, 0]
grads = tape.gradient(class_channel, conv_outputs)
grads = tf.maximum(grads, 0)

pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
conv_outputs = conv_outputs[0]
heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
heatmap = tf.squeeze(heatmap)

heatmap = np.maximum(heatmap, 0)
heatmap = heatmap / (np.max(heatmap) + 1e-8)
heatmap = cv2.resize(heatmap, img_size)

heatmap[heatmap < 0.6] = 0
heatmap = heatmap / (np.max(heatmap) + 1e-8)

heatmap = cv2.GaussianBlur(heatmap, (21, 21), 0)

img = cv2.imread(img_path)
img = cv2.resize(img, img_size)

probability = float(predictions[0][0].numpy())

if probability < 0.5:
    confidence = 1 - probability
    scaling_factor = confidence * 0.3
    heatmap = heatmap * scaling_factor
    print(f"No tumor detected (confidence: {confidence*100:.2f}%) - Heatmap scaled by {scaling_factor:.3f}")
else:
    confidence = probability
    print(f"Tumor detected (confidence: {confidence*100:.2f}%)")

mask = (heatmap > 0.6).astype(np.uint8)
heatmap_uint8 = np.uint8(255 * heatmap)
heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

mask_3ch = np.stack([mask, mask, mask], axis=2)

superimposed_img = np.where(
    mask_3ch == 1,
    cv2.addWeighted(img, 0.65, heatmap_colored, 0.35, 0),
    img
).astype(np.uint8)

plt.imshow(cv2.cvtColor(superimposed_img.astype('uint8'), cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.show()
