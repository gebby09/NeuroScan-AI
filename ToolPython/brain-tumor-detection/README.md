# brain-tumor-detection
Brain tumor detection using CNN and Grad-CAM visualization.

## Final model used by FastAPI

After the comparative evaluation, the FastAPI service uses:

- final model: `brain_tumor_efficientnetb0.keras`
- architecture: EfficientNetB0 pretrained on ImageNet
- input size: `224 x 224`
- inference preprocessing: `tensorflow.keras.applications.efficientnet.preprocess_input`
- Grad-CAM layer: `top_conv`

The legacy model `brain_tumor_model.keras` is kept in the project for reference,
but it is no longer the default inference model. To temporarily test another
model, set:

```bash
set BRAIN_TUMOR_MODEL_PATH=brain_tumor_mobilenetv2.keras
set BRAIN_TUMOR_GRADCAM_LAYER=Conv_1
python api.py
```

## Comparative model evaluation

Pentru justificarea alegerii modelului în documentația de licență se poate rula:

```bash
python compare_models.py
```

Scriptul compară trei arhitecturi pretrained pe același dataset. Fiecare model
folosește funcția oficială `preprocess_input` din Keras pentru arhitectura lui,
dar păstrează același split, aceeași dimensiune de input și același cap de
clasificare pentru transfer learning:

- MobileNetV2
- EfficientNetB0
- ResNet50

Dataset-ul folosit este cel existent în proiect:

- `dataset/train/tumor`
- `dataset/train/no_tumor`
- `dataset/test/tumor`
- `dataset/test/no_tumor`

Scriptul de comparație salvează modelele separat:

- `brain_tumor_mobilenetv2.keras`
- `brain_tumor_efficientnetb0.keras`
- `brain_tumor_resnet50.keras`

Rezultatele comparative sunt salvate în:

- `model_comparison_results.csv`
- `model_comparison_results.json`
- `model_comparison_table.md`

Dacă modelele comparative există deja, scriptul le evaluează fără reantrenare.
Modelul vechi `brain_tumor_model.keras` nu este copiat automat în comparația
oficială, deoarece a fost antrenat cu normalizare simplă `/255`, nu cu
`preprocess_input`. Pentru reantrenarea tuturor modelelor comparative:

```bash
python compare_models.py --retrain-existing
```
