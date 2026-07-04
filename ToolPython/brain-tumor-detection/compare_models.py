from __future__ import annotations

import argparse
import csv
import json
import os
import random
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0, MobileNetV2, ResNet50
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenetv2_preprocess
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet50_preprocess
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator


PROJECT_DIR = Path(__file__).resolve().parent
TRAIN_DIR = PROJECT_DIR / "dataset" / "train"
TEST_DIR = PROJECT_DIR / "dataset" / "test"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 5
VALIDATION_SPLIT = 0.2
SEED = 42

CSV_RESULTS_PATH = PROJECT_DIR / "model_comparison_results.csv"
JSON_RESULTS_PATH = PROJECT_DIR / "model_comparison_results.json"
MARKDOWN_TABLE_PATH = PROJECT_DIR / "model_comparison_table.md"


@dataclass(frozen=True)
class ModelConfig:
    display_name: str
    output_path: Path
    builder: Callable[[], tf.keras.Model]
    preprocess_input: Callable


def set_reproducibility(seed: int = SEED) -> None:
    os.environ["PYTHONHASHSEED"] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)


def build_transfer_model(backbone_factory: Callable[..., tf.keras.Model]) -> tf.keras.Model:
    base_model = backbone_factory(
        weights="imagenet",
        include_top=False,
        input_shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3),
    )
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation="relu")(x)
    predictions = Dense(1, activation="sigmoid")(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    return model


def get_model_configs() -> dict[str, ModelConfig]:
    return {
        "mobilenetv2": ModelConfig(
            display_name="MobileNetV2",
            output_path=PROJECT_DIR / "brain_tumor_mobilenetv2.keras",
            builder=lambda: build_transfer_model(MobileNetV2),
            preprocess_input=mobilenetv2_preprocess,
        ),
        "efficientnetb0": ModelConfig(
            display_name="EfficientNetB0",
            output_path=PROJECT_DIR / "brain_tumor_efficientnetb0.keras",
            builder=lambda: build_transfer_model(EfficientNetB0),
            preprocess_input=efficientnet_preprocess,
        ),
        "resnet50": ModelConfig(
            display_name="ResNet50",
            output_path=PROJECT_DIR / "brain_tumor_resnet50.keras",
            builder=lambda: build_transfer_model(ResNet50),
            preprocess_input=resnet50_preprocess,
        ),
    }


def create_generators(batch_size: int, preprocessing_function: Callable) -> tuple:
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocessing_function,
        validation_split=VALIDATION_SPLIT,
    )
    test_datagen = ImageDataGenerator(preprocessing_function=preprocessing_function)

    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMAGE_SIZE,
        batch_size=batch_size,
        class_mode="binary",
        subset="training",
        seed=SEED,
        shuffle=True,
    )

    validation_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMAGE_SIZE,
        batch_size=batch_size,
        class_mode="binary",
        subset="validation",
        seed=SEED,
        shuffle=False,
    )

    test_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMAGE_SIZE,
        batch_size=batch_size,
        class_mode="binary",
        shuffle=False,
    )

    return train_generator, validation_generator, test_generator


def train_or_load_model(
    config: ModelConfig,
    train_generator,
    validation_generator,
    epochs: int,
    retrain_existing: bool,
) -> tf.keras.Model:
    if config.output_path.exists() and not retrain_existing:
        print(f"[INFO] Loading existing model: {config.output_path.name}")
        return tf.keras.models.load_model(config.output_path)

    print(f"[INFO] Training {config.display_name}...")
    train_generator.reset()
    validation_generator.reset()

    model = config.builder()
    callbacks = [
        EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
        ),
        ModelCheckpoint(
            filepath=config.output_path,
            monitor="val_loss",
            save_best_only=True,
        ),
    ]

    model.fit(
        train_generator,
        epochs=epochs,
        validation_data=validation_generator,
        callbacks=callbacks,
    )

    model.save(config.output_path)
    return model


def auc_roc_score(y_true: np.ndarray, y_score: np.ndarray) -> float:
    y_true = y_true.astype(int)
    positives = y_true == 1
    negatives = y_true == 0
    n_pos = int(np.sum(positives))
    n_neg = int(np.sum(negatives))

    if n_pos == 0 or n_neg == 0:
        return float("nan")

    order = np.argsort(y_score)
    ranks = np.empty_like(order, dtype=float)
    ranks[order] = np.arange(1, len(y_score) + 1)

    unique_scores, inverse, counts = np.unique(y_score, return_inverse=True, return_counts=True)
    for score_index, count in enumerate(counts):
        if count > 1:
            tied_positions = np.where(inverse == score_index)[0]
            ranks[tied_positions] = float(np.mean(ranks[tied_positions]))

    rank_sum_pos = float(np.sum(ranks[positives]))
    auc = (rank_sum_pos - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg)
    return float(auc)


def evaluate_model(model: tf.keras.Model, test_generator) -> dict:
    test_generator.reset()
    probabilities = model.predict(test_generator).reshape(-1)
    y_true = test_generator.classes.astype(int)
    y_pred = (probabilities >= 0.5).astype(int)

    class_indices = test_generator.class_indices
    if class_indices.get("tumor") != 1 or class_indices.get("no_tumor") != 0:
        raise ValueError(f"Unexpected class mapping: {class_indices}")

    tp = int(np.sum((y_true == 1) & (y_pred == 1)))
    tn = int(np.sum((y_true == 0) & (y_pred == 0)))
    fp = int(np.sum((y_true == 0) & (y_pred == 1)))
    fn = int(np.sum((y_true == 1) & (y_pred == 0)))

    accuracy = (tp + tn) / max(tp + tn + fp + fn, 1)
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    specificity = tn / max(tn + fp, 1)
    f1_score = (2 * precision * recall) / max(precision + recall, 1e-8)
    auc = auc_roc_score(y_true, probabilities)

    return {
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "Specificity": specificity,
        "F1Score": f1_score,
        "AUC": auc,
        "TN": tn,
        "FP": fp,
        "FN": fn,
        "TP": tp,
    }


def measure_average_inference_time_ms(
    model: tf.keras.Model,
    test_generator,
    repeats: int = 30,
    warmup_repeats: int = 3,
) -> float:
    test_generator.reset()
    batch_images, _ = next(test_generator)

    for _ in range(warmup_repeats):
        model.predict(batch_images, verbose=0)

    start = time.perf_counter()
    for _ in range(repeats):
        model.predict(batch_images, verbose=0)
    elapsed = time.perf_counter() - start

    total_images = repeats * len(batch_images)
    return float((elapsed / total_images) * 1000)


def rounded(value: float, decimals: int = 4) -> float | None:
    if value is None or np.isnan(value):
        return None
    return round(float(value), decimals)


def save_results(results: list[dict]) -> None:
    fieldnames = [
        "Model",
        "Params",
        "Accuracy",
        "Precision",
        "Recall",
        "Specificity",
        "F1Score",
        "AUC",
        "TN",
        "FP",
        "FN",
        "TP",
        "AvgInferenceTimeMs",
    ]

    with CSV_RESULTS_PATH.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        for result in results:
            writer.writerow({key: result.get(key) for key in fieldnames})

    with JSON_RESULTS_PATH.open("w", encoding="utf-8") as json_file:
        json.dump(results, json_file, indent=2, ensure_ascii=False)

    with MARKDOWN_TABLE_PATH.open("w", encoding="utf-8") as md_file:
        md_file.write("| Model | Params | Accuracy | Precision | Recall/Sensitivity | Specificity | F1-score | AUC-ROC | Avg inference (ms) |\n")
        md_file.write("|---|---:|---:|---:|---:|---:|---:|---:|---:|\n")
        for result in results:
            md_file.write(
                f"| {result['Model']} "
                f"| {result['Params']:,} "
                f"| {result['Accuracy']:.4f} "
                f"| {result['Precision']:.4f} "
                f"| {result['Recall']:.4f} "
                f"| {result['Specificity']:.4f} "
                f"| {result['F1Score']:.4f} "
                f"| {result['AUC']:.4f} "
                f"| {result['AvgInferenceTimeMs']:.2f} |\n"
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train/evaluate MobileNetV2, EfficientNetB0 and ResNet50 on the NeuroScan AI MRI dataset."
    )
    parser.add_argument("--epochs", type=int, default=EPOCHS, help="Numărul maxim de epoci pentru fiecare model.")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE, help="Dimensiunea batch-ului.")
    parser.add_argument(
        "--retrain-existing",
        action="store_true",
        help="Reantrenează și modelele deja salvate. Fără acest flag, modelele existente sunt doar evaluate.",
    )
    parser.add_argument(
        "--models",
        nargs="+",
        choices=["mobilenetv2", "efficientnetb0", "resnet50"],
        default=["mobilenetv2", "efficientnetb0", "resnet50"],
        help="Lista arhitecturilor care vor fi rulate.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    set_reproducibility()

    configs = get_model_configs()
    results = []

    for model_key in args.models:
        config = configs[model_key]
        train_generator, validation_generator, test_generator = create_generators(
            args.batch_size,
            config.preprocess_input,
        )
        model = train_or_load_model(
            config=config,
            train_generator=train_generator,
            validation_generator=validation_generator,
            epochs=args.epochs,
            retrain_existing=args.retrain_existing,
        )

        metrics = evaluate_model(model, test_generator)
        avg_inference_ms = measure_average_inference_time_ms(model, test_generator)

        result = {
            "Model": config.display_name,
            "Params": int(model.count_params()),
            "Accuracy": rounded(metrics["Accuracy"]),
            "Precision": rounded(metrics["Precision"]),
            "Recall": rounded(metrics["Recall"]),
            "Specificity": rounded(metrics["Specificity"]),
            "F1Score": rounded(metrics["F1Score"]),
            "AUC": rounded(metrics["AUC"]),
            "TN": metrics["TN"],
            "FP": metrics["FP"],
            "FN": metrics["FN"],
            "TP": metrics["TP"],
            "AvgInferenceTimeMs": rounded(avg_inference_ms, 2),
            "ModelPath": str(config.output_path),
            "ConfusionMatrix": {
                "labels": ["no_tumor", "tumor"],
                "matrix": [
                    [metrics["TN"], metrics["FP"]],
                    [metrics["FN"], metrics["TP"]],
                ],
            },
        }
        results.append(result)
        print(f"[RESULT] {config.display_name}: F1={result['F1Score']}, Recall={result['Recall']}")

    save_results(results)

    best_f1 = max(results, key=lambda item: item["F1Score"])
    best_recall = max(results, key=lambda item: item["Recall"])
    print("\nSaved results:")
    print(f"- {CSV_RESULTS_PATH}")
    print(f"- {JSON_RESULTS_PATH}")
    print(f"- {MARKDOWN_TABLE_PATH}")
    print(f"\nBest F1-score: {best_f1['Model']} ({best_f1['F1Score']})")
    print(f"Best tumor recall/sensitivity: {best_recall['Model']} ({best_recall['Recall']})")


if __name__ == "__main__":
    main()
