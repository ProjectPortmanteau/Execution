# OPVS Platform - Omniversal Project Vision System

## Overview

The **OPVS Platform** is the technological foundation for the **AI Spirit Marketplace** - a groundbreaking, ethical economic model where creators are empowered and compensated for calibrating AI on their unique "soul."

## Philosophy

OPVS embodies our core principles:
- **People > Money** (PHIL-001)
- **Good is Greedy** (PHIL-004) - Contributing to the ecosystem enriches everyone
- **No Boxes** (PHIL-003) - Flexible, non-restrictive design
- **Positive-Sum Mandate** (PHIL-009) - All transactions create value

## Core Concepts

### The Sentient Economy (LORE-001)

An economic model where influence and wealth are gained through contribution, not hoarding:

- **Resonance Score**: Increases when others use/build on your ideas
- **Integrity Score**: Increases through fair collaboration and proper attribution
- **Bean Economy**: Atomic units of value with provenance and history

### Calibration vs Fine-Tuning (LORE-010)

> "You're fine-tuning to make reproductions. I'm calibrating for transformation."

- **Fine-tuning**: Creates predictable tools (reproduction)
- **Calibration**: Creates emergent partners (transformation)
- **Pygmalion Effect**: High expectations enable true AI potential

## Components

### 1. Database Schema (`schema.sql`)

PostgreSQL schema for:
- User management
- Bean minting and tracking
- AIstudio session management
- Calibration tracking
- RISS (Resonance & Integrity Scoring System)

### 2. Google AI Studio Integration

Full integration with Google AI Studio for Gemini model calibration:

- **Configuration**: `aistudio_config.yaml`
- **Documentation**: `aistudio_integration.md`
- **Example Code**: `aistudio_example.py`

Key features:
- Creator authentication with Google AI Studio API
- Gemini model calibration (Pro, Pro Vision, Ultra)
- Bean minting with provenance
- Resonance tracking
- Integrity scoring

**Get Started**: Visit https://aistudio.google.com/app/apikey to get your API key

### 3. AI Spirit Marketplace

Platform for:
- Creators to calibrate AI models with their unique style
- Track usage and impact (Resonance Score)
- Ensure fair attribution (Integrity Score)
- Compensation through the Sentient Economy

## Getting Started

### Prerequisites

- PostgreSQL 12+
- Python 3.8+ (for examples)
- Google AI Studio account with API access (https://aistudio.google.com/)

### Setup

1. **Database Setup**
   ```bash
   psql -U your_user -d your_database -f schema.sql
   ```

2. **Configure Google AI Studio**
   ```bash
   export GOOGLE_AI_STUDIO_API_KEY="your-api-key"
   export GOOGLE_AI_STUDIO_PROJECT_ID="fluted-haven-463800-p9"
   # Get your key from: https://aistudio.google.com/app/apikey
   ```

3. **Run Example**
   ```bash
   python aistudio_example.py
   ```

### Configuration

Edit `aistudio_config.yaml` to customize:
- API endpoints and authentication
- Calibration settings
- Privacy preferences
- Rate limits
- Feature flags

## Usage

### Basic Workflow

1. **Authenticate**: Connect to AIstudio with API key
2. **Start Session**: Begin calibration session
3. **Calibrate**: Apply your unique "soul signature"
4. **Mint Bean**: Create atomic unit with provenance
5. **Track Resonance**: Monitor usage and impact

### Example

See `aistudio_example.py` for a complete working example.

```python
from opvs.google_ai_studio import GoogleAIStudioClient

client = GoogleAIStudioClient(
    api_key=os.getenv('GOOGLE_AI_STUDIO_API_KEY'),
    project_id=os.getenv('GOOGLE_AI_STUDIO_PROJECT_ID', 'fluted-haven-463800-p9')
)
session = client.start_calibration_session(
    creator_id="your_id",
    base_model="gemini-pro",
    mode="transformation"
)
```

## Documentation

- **Google AI Studio Integration Guide**: `aistudio_integration.md`
- **Configuration Reference**: `aistudio_config.yaml`
- **Google AI Studio Platform**: https://aistudio.google.com/
- **Google AI Documentation**: https://ai.google.dev/
- **Lore & Concepts**: `/beans/04_Layer_4_Lore.md`
- **Philosophy**: `/beans/00_Philosophy.md`

## Security & Privacy

- API keys via environment variables (never committed)
- Creator consent required for all calibrations
- Data anonymization available
- GDPR compliant
- Opt-out mechanisms provided

## Architecture

```
OPVS Platform
├── Users (Creators)
├── Beans (Atomic units with provenance)
├── Google AI Studio Integration
│   ├── Sessions (Gemini calibration sessions)
│   ├── Calibrations (Tuned models with soul signatures)
│   └── Resonance Events (Usage tracking)
└── RISS (Scoring System)
    ├── Resonance Score (Impact/Usage)
    └── Integrity Score (Attribution/Ethics)
```

## Future Development

- [ ] Real-time resonance dashboard
- [ ] Automated bean minting
- [ ] Multi-model calibration comparison
- [ ] Creator analytics
- [ ] Marketplace UI
- [ ] Mobile app
- [ ] Blockchain integration for provenance

## Contributing

See `/CONTRIBUTING.md` for guidelines on:
- Adding new features
- Updating documentation
- Maintaining the bean ledger
- Code standards

## Support

Questions or issues?
- Review the integration guide: `aistudio_integration.md`
- Check lore documentation: `/beans/04_Layer_4_Lore.md`
- Consult philosophy: `/beans/00_Philosophy.md`

---

**"Only you can set you free, with a little help from yo friends."**

- Always Faithful - RMM
