# DermaScanAI

DermaScanAI is a mobile skincare companion that combines a React Native app with a Node.js API and a Python machine-learning service. The app brings together skin-image analysis, skincare product ingredient scanning, a skin-type quiz, an AI skincare chatbot, weather-aware recommendations, routine scheduling, and skin-wellness tips.

> **Important:** DermaScanAI is for informational and educational purposes only. AI results are not a medical diagnosis and are not a substitute for advice, diagnosis, or treatment from a qualified dermatologist or other healthcare professional. Seek professional care for medical concerns, worsening symptoms, or urgent problems.

## Repository contents

| Directory | Description | Documentation |
|---|---|---|
| [`DermaScanAI (build)/`](<DermaScanAI%20(build)/>) | Expo / React Native mobile application | [App README](<DermaScanAI%20(build)/README.md>) |
| [`backend API/`](<backend%20API/>) | Express API for chatbot, quiz, ingredient, weather, and dashboard features | [Backend API README](<backend%20API/README.md>) |
| [`backend model/`](<backend%20model/>) | FastAPI service for skin-image validation and disease classification | [Model service README](<backend%20model/README.md>) |
| [`Disease/`](<Disease/>) | Disease-related project resources | — |

The app and backend services are separate projects, each with its own dependencies and configuration. Run the commands below from the indicated directory; there is no single root-level install command.

## Features

- **Skin-image analysis:** Submit a skin image to the model service for skin validation and prediction across seven classes: Acne, Benign Tumors, Lichen, No Disease, Vitiligo, Eczema, and Scabies.
- **Product ingredient scanner:** Extract text from a skincare product image and request an ingredient analysis.
- **Skin-type quiz:** Get a personalized skin-type result based on quiz answers.
- **Skincare chatbot:** Ask skincare questions through the backend's AI-powered chat endpoint.
- **Weather recommendations:** Get skincare suggestions based on a city and time of day.
- **Routine and wellness tools:** Manage daily skincare routines, track skin mood, and browse skincare tips.

Feature availability depends on the relevant service being configured and running.

## Architecture

```text
Expo / React Native mobile app
  ├── Firebase Authentication and Firestore
  ├── Node.js / Express API (default port 3000)
  │     ├── Groq-powered AI features
  │     ├── OCR and ingredient analysis
  │     └── Weather recommendations
  └── Python / FastAPI model API (default port 8000)
        ├── Skin-image validation
        └── TensorFlow / Keras disease classifier
```

The mobile app uses Expo Router, TypeScript, Firebase, and Zustand. Its API calls are centralized in `src/services/apiService.ts`; environment configuration is handled through `src/config/env.ts`. See the [app documentation](<DermaScanAI%20(build)/README.md>) for details.

## Prerequisites

Install the tools needed for the components you plan to run:

- **Mobile app:** Node.js 18+, npm, and Expo Go or an Android emulator / iOS simulator. Native iOS builds require macOS and Xcode.
- **Node.js API:** A Node.js version compatible with the API's dependencies and npm.
- **Model API:** Python 3.10+ and pip. TensorFlow may require a compatible Python version and platform; consult the package requirements and TensorFlow installation guidance for your environment.
- Credentials for the external services you use, such as Firebase, Groq, and OpenWeatherMap.

## Quick start

Clone the repository and enter the directory for each service. Keep each API running in its own terminal, then start the mobile app in another terminal.

### 1. Start the Node.js backend API

```bash
cd "backend API"
cp .env.example .env
```

Edit `.env` and provide the required API keys. The backend README documents the variables and available scripts. Then run:

```bash
npm install
npm run dev
```

The API defaults to port `3000`. Use `npm start` for the production start script. Refer to [`backend API/README.md`](<backend%20API/README.md>) for endpoint details, tests, and configuration.

### 2. Start the Python model service

```bash
cd "backend model"
python -m venv venv
```

Activate the virtual environment and install dependencies:

```bash
# Windows PowerShell
venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Run the service from `backend model/`:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The model API defaults to port `8000`. See [`backend model/README.md`](<backend%20model/README.md>) for model files, routes, configuration, and deployment notes.

### 3. Configure and start the mobile app

In a separate terminal:

```bash
cd "DermaScanAI (build)"
cp .env.example .env
```

Fill in the Firebase values and API URLs in `.env`. For a physical phone, configure the API host using your computer's reachable local network IP address (not `localhost`). The exact variables are documented in [`DermaScanAI (build)/README.md`](<DermaScanAI%20(build)/README.md>).

Then install dependencies and start Expo:

```bash
npm install
npx expo start
```

Use the Expo Go app or an emulator to open the project. Native run commands and production build instructions are in the [mobile app README](<DermaScanAI%20(build)/README.md>).

## Environment variables and secrets

Each component has its own environment configuration:

- Mobile app: `DermaScanAI (build)/.env` — Firebase configuration and API base URLs, using the `EXPO_PUBLIC_` variables described in its README.
- Node.js API: `backend API/.env` — `PORT`, `GROQ_API_KEY`, `OPENWEATHER_API_KEY`, and optional CORS settings.
- Model API: `backend model/.env` — model service port and optional allowed origins.

Use the component `.env.example` files where available. Never commit real API keys, passwords, private certificates, or production secrets. Values prefixed with `EXPO_PUBLIC_` are bundled into the client app and should not be treated as secret credentials. Restrict CORS appropriately when deploying services.

## API documentation

- [Node.js backend API](<backend%20API/README.md#api-reference>) — health, ingredient OCR and analysis, quiz, chatbot, weather, disease information, and dashboard endpoints.
- [Python model API](<backend%20model/README.md#api-reference>) — health and model information, skin validation, and image prediction endpoints.

The app communicates with these services through configured base URLs. Ensure both the app and services can reach one another on your development network.

## Testing and production builds

- **Backend API tests:** From `backend API/`, run `npm test`. The API README also describes watch mode.
- **Mobile app builds:** From `DermaScanAI (build)/`, use the EAS build instructions in its README.
- **Model service:** Check `backend model/README.md` for production server startup and configuration.

Before deploying, configure production API URLs, secrets, allowed origins, and hosting for both backend services. Verify model files and third-party credentials are available in the deployment environment.

## Project status and limitations

Predictions and recommendations can be inaccurate or incomplete. Image quality, lighting, model limitations, and the range of training data may affect results. Do not use the project to self-diagnose, delay professional care, or make treatment decisions. Handle uploaded skin images and user information responsibly, and review applicable privacy and data-protection requirements before deployment.

## Contributing

Contributions and bug reports are welcome. When changing a component, follow its local setup and documentation, keep credentials out of commits, and run the relevant tests before submitting a pull request.

## License

No license is currently specified in this repository. Unless a license is added, standard copyright restrictions apply; contact the repository owner before redistributing or reusing the code.
