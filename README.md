# NeuroScan AI

NeuroScan AI este o aplicație web realizată pentru lucrarea de licență, destinată gestionării unui flux de analiză a imaginilor RMN cerebrale. Proiectul combină un frontend React, un backend Spring Boot și un serviciu Python/FastAPI pentru clasificarea imaginilor RMN în clasele `tumor` și `no_tumor`, cu suport pentru vizualizare explicabilă prin GradCAM.

## Structura proiectului

```text
NeuroScan-AI/
├── Backend/      # API Spring Boot, securitate JWT, PostgreSQL, reguli de business
├── FrontEnd/     # Interfață React + TypeScript + TanStack Router
├── ToolPython/   # Serviciu FastAPI pentru inferență AI și GradCAM
├── README.md
└── .gitignore
```

## Componente principale

- `Backend` - aplicație Spring Boot cu endpoint-uri REST pentru autentificare, pacienți, doctori, administratori, notificări, tichete de suport și workflow-ul RMN.
- `FrontEnd` - aplicație React/TypeScript cu interfețe separate pentru pacient, doctor și administrator.
- `ToolPython/brain-tumor-detection` - serviciu FastAPI care încarcă modelul Keras final și returnează predicția, confidence-ul, probability și imaginea GradCAM.

## Cerințe locale

- Java 17
- Maven Wrapper inclus în proiect
- Node.js și npm
- Python 3.10+ recomandat
- PostgreSQL

## Configurare backend

Înainte de rulare, creează fișierul local:

```powershell
Copy-Item Backend\src\main\resources\application-example.properties Backend\src\main\resources\application.properties
```

Completează în `application.properties` datele locale pentru PostgreSQL, secretul JWT și cheia Gemini, dacă folosești chatbot-ul.

Fișierul `application.properties` este ignorat de Git pentru a evita publicarea parolelor și a cheilor API.

## Pornire backend

```powershell
cd Backend
.\mvnw spring-boot:run
```

Backend-ul rulează implicit pe:

```text
http://localhost:8080
```

## Pornire frontend

```powershell
cd FrontEnd
npm install
npm run dev
```

Frontend-ul rulează implicit pe:

```text
http://localhost:8081
```

## Pornire serviciu Python/FastAPI

```powershell
cd ToolPython\brain-tumor-detection
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python api.py
```

Serviciul FastAPI rulează implicit pe:

```text
http://localhost:8000
```

## Modelul AI

Modelul final folosit de serviciul FastAPI este EfficientNetB0, ales în urma comparației experimentale cu MobileNetV2 și ResNet50. Modelele `.keras` și dataset-ul nu sunt incluse în repository, deoarece sunt fișiere binare/mari. Acestea trebuie generate local prin scripturile de training sau păstrate separat.

Pentru comparația modelelor:

```powershell
cd ToolPython\brain-tumor-detection
python compare_models.py
```

Scriptul generează:

- `model_comparison_results.csv`
- `model_comparison_results.json`
- `model_comparison_table.md`

## Dataset

Dataset-ul utilizat pentru antrenare și evaluare este Brain Tumor Detection 2020 de pe Kaggle:

https://www.kaggle.com/datasets/mikhaelapg/brain-tumor-detection

După descărcare, structura locală a dataset-ului trebuie să respecte forma așteptată de scripturile Python:

```text
ToolPython/brain-tumor-detection/dataset/
├── train/
│   ├── tumor/
│   └── no_tumor/
└── test/
    ├── tumor/
    └── no_tumor/
```

## Observații pentru publicarea pe GitHub

Repository-ul trebuie să conțină codul sursă, fișierele de configurare exemplu și README-ul. Nu trebuie publicate:

- `node_modules`
- `dist`
- `target`
- `uploads`
- dataset-ul de imagini
- modelele `.keras`
- fișierele locale cu parole sau chei API

## Autor

Gabor Andrei Daniel
