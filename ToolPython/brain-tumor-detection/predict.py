model_path = "brain_tumor_efficientnetb0.keras"
img_size = (224, 224)

import tensorflow as tf
import numpy as np
import sys
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input

if len(sys.argv) < 2:
    print("Usage: python predict.py <image_path>")
    sys.exit()

model = tf.keras.models.load_model(model_path)

img_path = sys.argv[1]
img = image.load_img(img_path, target_size=img_size)
img_array = image.img_to_array(img)
img_array = preprocess_input(img_array.astype(np.float32))
img_array = np.expand_dims(img_array, axis=0)

prediction = model.predict(img_array)

prob = prediction[0][0]

if prob >= 0.5:
    label = "Tumor detected"
    confidence = prob
else:
    label = "No tumor detected"
    confidence = 1 - prob

print(f"Raw probability: {prob}")

print(f"Prediction: {label} ({confidence*100:.2f}% confidence)")
