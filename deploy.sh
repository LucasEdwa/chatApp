#!/bin/bash
# ============================================
# Google Cloud Run Deployment Script
# Chat API (Backend only)
# ============================================

set -e

# ---- CONFIGURATION (edit these) ----
PROJECT_ID="YOUR_GCP_PROJECT_ID"       # <-- Replace with your GCP project ID
REGION="europe-north1"                 # Finland (closest to Sweden)
BACKEND_SERVICE="chat-api"
# ------------------------------------

echo "============================================"
echo "  Chat API → Google Cloud Run Deployment"
echo "============================================"

# Check if gcloud is installed, if not install it
if ! command -v gcloud &> /dev/null; then
  echo "📦 gcloud CLI not found. Installing..."
  if [[ "$(uname)" == "Darwin" ]]; then
    if command -v brew &> /dev/null; then
      brew install --cask google-cloud-sdk
    else
      echo "❌ Homebrew not found. Install gcloud manually: https://cloud.google.com/sdk/docs/install"
      exit 1
    fi
  else
    curl -sSL https://sdk.cloud.google.com | bash
    exec -l $SHELL
  fi
fi

# Login to Google Cloud
echo ""
echo "🔑 Logging in to Google Cloud..."
gcloud auth login

# Set project
echo ""
echo "📌 Setting GCP project to: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo ""
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com

# ============================================
# Deploy Backend (chatApi)
# ============================================
echo ""
echo "🚀 Building & deploying Chat API..."
cd chatApi

gcloud run deploy "$BACKEND_SERVICE" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --session-affinity \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=8080"

# Get the backend URL
BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --region "$REGION" --format 'value(status.url)')

cd ..

# ============================================
# DONE
# ============================================
echo ""
echo "============================================"
echo "  ✅ Deployment Complete!"
echo "============================================"
echo ""
echo "  Chat API: $BACKEND_URL"
echo ""
echo "  Update your frontend .env with:"
echo "  VITE_CHAT_API_URL=$BACKEND_URL"
echo "============================================"
