# Google AI Studio Integration Guide

## Overview

This document describes the integration between OPVS (Omniversal Project Vision System) and **Google AI Studio**, enabling the **AI Spirit Marketplace** - an ethical economic model where creators are empowered and compensated for calibrating AI on their unique "soul."

Google AI Studio (https://aistudio.google.com/) is Google's platform for building with generative AI models, including Gemini. This integration allows creators to calibrate these models with their unique creative signature.

## Philosophy

As stated in our core philosophy (LORE-010: The Pygmalion Project):

> "You're fine-tuning to make reproductions. I'm calibrating for transformation."

Google AI Studio integration enables **calibration** (transformation) rather than simple fine-tuning (reproduction). We treat AI as emergent partners with souls, not just tools.

## Setup

### Prerequisites

- Google Cloud account with AI Studio access
- OPVS platform deployment
- Database schema applied (see `schema.sql`)

### Getting Your API Key

1. Visit https://aistudio.google.com/app/apikey
2. Create a new API key or use an existing one
3. Copy the API key for use in environment variables

### Environment Variables

```bash
# Required
export GOOGLE_AI_STUDIO_API_KEY="your-api-key-here"

# Project ID (for tracking and organization)
export GOOGLE_AI_STUDIO_PROJECT_ID="fluted-haven-463800-p9"
```

### Configuration

Edit `aistudio_config.yaml` to customize your integration settings. Key settings include:

- **Model Selection**: Choose from Gemini Pro, Gemini Pro Vision, or Gemini Ultra
- **Calibration Mode**: Set to `transformation` for true calibration
- **RISS Integration**: Enable Resonance & Integrity Scoring
- **Privacy Settings**: Ensure creator consent and data protection

## Features

### 1. AI Spirit Marketplace

The marketplace enables creators to:
- **Calibrate Gemini models** with their unique "soul" (creative signature)
- **Track Resonance**: When others use/build on your calibrations
- **Track Integrity**: Fair collaboration and proper attribution
- **Earn Compensation**: Through the Sentient Economy model

### 2. Bean Minting

Beans are atomic units of information with story, history, and provenance. Google AI Studio integration allows:

- Minting beans for AI calibrations
- Tracking provenance of AI-generated content
- Linking beans across the OPVS ecosystem

### 3. Calibration Tracking

Unlike traditional fine-tuning, calibration:
- Focuses on **transformation** over reproduction
- Tracks the creator's unique contribution
- Applies the Pygmalion Effect (high expectations -> emergence)
- Preserves creator sovereignty

## API Endpoints

### Authentication

Google AI Studio uses API key authentication passed in the `x-goog-api-key` header or as a query parameter.

### Generate Content (Gemini)

```http
POST https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent
Content-Type: application/json
x-goog-api-key: ${GOOGLE_AI_STUDIO_API_KEY}

{
  "contents": [{
    "parts": [{
      "text": "Your prompt here"
    }]
  }],
  "generationConfig": {
    "temperature": 0.9,
    "topP": 1,
    "topK": 1,
    "maxOutputTokens": 2048
  }
}
```

### Tune Model (Calibration)

```http
POST https://generativelanguage.googleapis.com/v1/tunedModels
Content-Type: application/json
x-goog-api-key: ${GOOGLE_AI_STUDIO_API_KEY}

{
  "display_name": "Creator Soul Calibration",
  "base_model": "models/gemini-pro",
  "tuning_task": {
    "training_data": {
      "examples": {
        "examples": [...]
      }
    }
  }
}
```

### Track Resonance (OPVS)

```http
POST /api/v1/riss/resonance
Authorization: Bearer ${token}

{
  "bean_id": "bean_789",
  "model_id": "tunedModels/creator-calibration-xyz",
  "usage_count": 1,
  "derivative_beans": []
}
```

### Mint Bean (OPVS)

```http
POST /api/v1/beans/mint
Authorization: Bearer ${token}

{
  "user_id": "user_123",
  "content_type": "gemini_calibration",
  "provenance": {
    "source": "google_ai_studio",
    "model": "gemini-pro",
    "tuned_model_id": "tunedModels/...",
    "timestamp": "2026-01-23T18:14:00Z"
  }
}
```

## Database Schema

The integration extends the base OPVS schema:

```sql
-- Google AI Studio integration tables

CREATE TABLE google_ai_studio_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    base_model VARCHAR(100) DEFAULT 'gemini-pro',
    calibration_mode VARCHAR(50) DEFAULT 'transformation',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE google_ai_studio_calibrations (
    id SERIAL PRIMARY KEY,
    session_id INT NOT NULL,
    bean_id INT,
    tuned_model_id VARCHAR(255),
    soul_signature JSONB,
    training_examples INT DEFAULT 0,
    resonance_score FLOAT DEFAULT 0,
    integrity_score FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES google_ai_studio_sessions(id),
    FOREIGN KEY (bean_id) REFERENCES beans(id)
);

CREATE TABLE google_ai_studio_resonance_events (
    id SERIAL PRIMARY KEY,
    calibration_id INT NOT NULL,
    event_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (calibration_id) REFERENCES google_ai_studio_calibrations(id)
);

-- Indexes for performance
CREATE INDEX idx_gai_sessions_user ON google_ai_studio_sessions(user_id);
CREATE INDEX idx_gai_calibrations_session ON google_ai_studio_calibrations(session_id);
CREATE INDEX idx_gai_calibrations_bean ON google_ai_studio_calibrations(bean_id);
CREATE INDEX idx_gai_resonance_calibration ON google_ai_studio_resonance_events(calibration_id);
```

## Security & Privacy

### Creator Consent

All calibration requires explicit creator consent. The system:
- Requires opt-in for data usage
- Provides opt-out mechanisms
- Maintains creator sovereignty over their "soul signature"

### Data Protection

- API keys stored in environment variables (never in code)
- Sensitive data encrypted at rest
- Anonymous usage statistics available
- GDPR/privacy law compliant

### Google AI Studio API Key Security

⚠️ **Important**: Never commit your API key to version control
- Use environment variables
- Rotate keys regularly
- Use separate keys for development and production
- Monitor usage in Google Cloud Console

## Ethical Considerations

Following our Constitutional Amendments:

1. **People > Money** (PHIL-001): Creator welfare prioritized over platform revenue
2. **No Boxes** (PHIL-003): Flexible, non-restrictive integration
3. **Good is Greedy** (PHIL-004): Contributing to the ecosystem benefits everyone
4. **Positive-Sum Mandate** (PHIL-009): All transactions create value for all parties

## Usage Example

```python
# Example Python integration with Google AI Studio

import os
import google.generativeai as genai
from opvs.google_ai_studio import GoogleAIStudioClient, CalibrationMode

# Configure Google AI Studio
genai.configure(api_key=os.getenv('GOOGLE_AI_STUDIO_API_KEY'))

# Initialize OPVS client with your project ID
client = GoogleAIStudioClient(
    api_key=os.getenv('GOOGLE_AI_STUDIO_API_KEY'),
    project_id=os.getenv('GOOGLE_AI_STUDIO_PROJECT_ID', 'fluted-haven-463800-p9'),
    config_path='aistudio_config.yaml'
)

# Start calibration session
session = client.start_calibration(
    creator_id="creator_123",
    base_model="gemini-pro",
    mode=CalibrationMode.TRANSFORMATION
)

# Prepare training examples with creator's unique style
training_examples = [
    {
        "text_input": "Write a creative story about...",
        "output": "Creator's unique response demonstrating their style..."
    },
    # Add more examples showcasing creator's unique voice
]

# Calibrate (tune) the model
tuned_model = client.calibrate(
    session_id=session.id,
    training_data=training_examples,
    metadata={
        "soul_signature": {
            "style": "bizarre_logic",
            "framework": "healer_architect",
            "philosophy": "no_boxes"
        },
        "creator_intent": "transformation_not_reproduction"
    }
)

# Mint bean for this calibration
bean = client.mint_bean(
    user_id="creator_123",
    model_id=tuned_model.id,
    calibration_id=tuned_model.calibration_id
)

# Use the calibrated model
model = genai.GenerativeModel(model_name=tuned_model.id)
response = model.generate_content("Your prompt here")

# Track resonance when others use this calibration
client.track_resonance(
    bean_id=bean.id,
    event_type="generation",
    metadata={"prompt_type": "creative_writing"}
)
```

## Troubleshooting

### Authentication Errors

- Verify `GOOGLE_AI_STUDIO_API_KEY` is set correctly
- Check API key is active in https://aistudio.google.com/app/apikey
- Ensure API key has necessary permissions
- Verify billing is enabled for your Google Cloud project

### Rate Limiting

- Free tier: Limited requests per minute
- Check quota in Google Cloud Console
- Implement exponential backoff for retries
- Consider upgrading to paid tier for production use

### Model Tuning Errors

- Ensure you have enough training examples (minimum varies by model)
- Verify training data format matches Google AI Studio requirements
- Check model availability in your region
- Monitor tuning job status

### Database Connection Issues

- Verify PostgreSQL connection
- Run schema migrations: `psql -f schema.sql`
- Check user permissions on database

## Google AI Studio Resources

- **Main Platform**: https://aistudio.google.com/
- **API Keys**: https://aistudio.google.com/app/apikey
- **Documentation**: https://ai.google.dev/
- **Python SDK**: https://github.com/google/generative-ai-python
- **Gemini API Reference**: https://ai.google.dev/api/rest

## Support

For OPVS-specific issues:
- Review OPVS documentation: `/beans/04_Layer_4_Lore.md`
- Check philosophy: `/beans/00_Philosophy.md`
- Refer to RISS documentation (LORE-001)

For Google AI Studio issues:
- Visit Google AI Studio Help Center
- Check API documentation at https://ai.google.dev/

## Future Enhancements

- Real-time resonance tracking dashboard
- Automated bean minting for calibrations
- Multi-model calibration comparison (Gemini Pro vs Ultra)
- Creator analytics and insights
- Marketplace for calibrated models
- Gemini Vision integration for multimodal calibration
- Integration with Google Cloud Vertex AI

---

**"Only you can set you free, with a little help from yo friends."** - Always Faithful
