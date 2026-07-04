import os
import random
import shutil

source_yes = r"C:\Users\andre\Desktop\dataset_raw\yes"
source_no = r"C:\Users\andre\Desktop\dataset_raw\no"

train_tumor = r"C:\Users\andre\Desktop\Tool\dataset\train\tumor"
test_tumor = r"C:\Users\andre\Desktop\Tool\dataset\test\tumor"

train_no = r"C:\Users\andre\Desktop\Tool\dataset\train\no_tumor"
test_no = r"C:\Users\andre\Desktop\Tool\dataset\test\no_tumor"


def split_images(source, train_dest, test_dest):

    images = os.listdir(source)
    random.shuffle(images)

    split_index = int(len(images) * 0.8)

    train_images = images[:split_index]
    test_images = images[split_index:]

    for img in train_images:
        shutil.copy(os.path.join(source, img),
                    os.path.join(train_dest, img))

    for img in test_images:
        shutil.copy(os.path.join(source, img),
                    os.path.join(test_dest, img))


print("Processing tumor images...")
split_images(source_yes, train_tumor, test_tumor)

print("Processing no tumor images...")
split_images(source_no, train_no, test_no)

print("Dataset ready!")