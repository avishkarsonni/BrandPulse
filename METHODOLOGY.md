# BrandPulse Project - Methodology Documentation

## Proposed Methodology: Framework, Algorithms, Tools, Datasets, and Techniques

---

## 📚 **1. FRAMEWORKS & TECHNOLOGIES**

### **1.1 Frontend Framework**

#### **Core Framework**
- **React 18.2.0** - Modern UI framework with hooks, concurrent features, and component-based architecture
- **React Router 6.3.0** - Client-side routing and navigation
- **React DOM 18.2.0** - React rendering for the web

#### **UI Component Libraries**
- **Material-UI (MUI) 5.10.0** - Comprehensive component library with theming
  - `@mui/material` - Core components
  - `@mui/icons-material` - Icon set
- **Emotion** (v11.10.0) - CSS-in-JS styling solution
  - `@emotion/react`
  - `@emotion/styled`

#### **Visualization Libraries**
- **Chart.js 3.9.1** - Charting library
- **React-Chartjs-2 4.3.1** - React wrapper for Chart.js
- **Recharts 2.5.0** - Composable charting library built on React components

#### **Animation & Interaction**
- **Framer Motion 10.18.0** - Animation library for React
- **Lodash 4.17.21** - Utility library for data manipulation

#### **Data Formatting & Parsing**
- **React-Markdown 10.1.0** - Markdown rendering component
- **Remark-GFM 4.0.1** - GitHub Flavored Markdown support
- **Moment.js 2.29.4** - Date/time manipulation
- **date-fns 2.29.2** - Modern date utility library

#### **HTTP Client**
- **Axios 0.27.2** - Promise-based HTTP client for API requests

---

### **1.2 Backend Framework**

#### **Core Framework**
- **FastAPI 0.116.2** - Modern, fast Python web framework
  - Automatic API documentation (OpenAPI/Swagger)
  - Type hints and Pydantic validation
  - Async/await support

#### **ASGI Server**
- **Uvicorn 0.35.0** - Lightning-fast ASGI server
  - Standard implementation with additional dependencies

#### **Data Validation**
- **Pydantic** (via FastAPI) - Data validation using Python type annotations

#### **Middleware**
- **CORS Middleware** - Cross-origin resource sharing for React frontend

#### **HTTP Client (Backend)**
- **httpx ≥0.28.1** - Async HTTP client for backend-to-backend communication

---

### **1.3 Database Technologies**

#### **Primary Database**
- **MySQL 8.0** - Relational database management system
  - JSON column support
  - Full-text search capabilities
  - Transactional ACID compliance

#### **Database Drivers**
- **PyMySQL 1.1.0+** - Pure Python MySQL client library
- **mysql-connector-python 8.0.33+** - Official Oracle MySQL connector
- **psycopg2-binary 2.9.9** - PostgreSQL adapter (if used)
- **asyncpg 0.29.0** - Fast async PostgreSQL driver

#### **ORM & Database Tools**
- **SQLAlchemy 2.0.23** - SQL toolkit and ORM
- **Alembic 1.13.1** - Database migration tool

#### **Caching**
- **Redis 7-alpine** - In-memory data structure store
  - Session management
  - Query result caching
  - Real-time data storage

---

### **1.4 AI/ML Technologies**

#### **Large Language Model (LLM)**
- **Google ADK (Agent Development Kit) 1.14.1** - AI agent framework
- **Google Generative AI 0.8.3** - Gemini API integration
- **Gemini 2.0 Flash** - Large language model for natural language processing
  - Product perception analysis
  - Sentiment interpretation
  - Conversational AI

#### **Deep Learning Framework**
- **TensorFlow 2.10.0+** - Machine learning platform
- **Keras** (via TensorFlow) - High-level neural networks API

#### **Pre-trained Word Embeddings**
- **GloVe (Global Vectors for Word Representation)**
  - 200-dimensional word embeddings
  - 6B token dataset
  - Stanford NLP pre-trained vectors
  - Download URL: `http://nlp.stanford.edu/data/glove.6B.zip`

---

### **1.5 DevOps & Containerization**

#### **Containerization**
- **Docker** - Container platform
  - Multi-service orchestration
  - Service isolation
  - Network management

#### **Orchestration**
- **Docker Compose 3.8** - Multi-container Docker application management

#### **Web Server**
- **Nginx Alpine** - High-performance web server and reverse proxy
  - Load balancing
  - SSL/TLS termination
  - Static file serving

---

## 🧠 **2. ALGORITHMS & MODELS**

### **2.1 Sentiment Analysis Model**

#### **Architecture: Multi-Task BiLSTM with Attention**

**Model Type:** Multi-Task Learning Neural Network

**Primary Tasks:**
1. **Sarcasm/Irony Detection** - Binary classification (literal vs. figurative)
2. **Sentiment Analysis** - Binary classification (positive vs. negative)

#### **Architecture Details:**

```
Input Layer
    ↓
[Embedding Layer - GloVe 200d]
    ↓
[Shared BiLSTM Layer 1 - 128 units, return_sequences=True]
    ↓
[Batch Normalization]
    ↓
[Shared BiLSTM Layer 2 - 64 units, return_sequences=True]
    ↓
[Batch Normalization]
    ↓
[Multi-Head Attention - 4 heads, key_dim=32]
    ↓
[Layer Normalization]
    ↓
[Shared BiLSTM Layer 3 - 32 units, return_sequences=False]
    ↓
[Batch Normalization] → Shared Features
    ↓
    ├─────────────────────────┬─────────────────────────┐
    ↓                         ↓                         ↓
[Sarcasm Branch]      [Shared Features]    [Sentiment Branch]
    ↓                         ↓                         ↓
Dense(64, ReLU)              └──────→ Concatenate ←───┘
    ↓                                      ↓
BatchNorm + Dropout(0.4)         Dense(128, ReLU)
    ↓                                      ↓
Dense(32, ReLU)                  BatchNorm + Dropout(0.5)
    ↓                                      ↓
BatchNorm + Dropout(0.3)         Dense(64, ReLU)
    ↓                                      ↓
Dense(2, Softmax)                BatchNorm + Dropout(0.3)
    ↓                                      ↓
Sarcasm Output                   Dense(32, ReLU)
(Literal/Figurative)                      ↓
                                 BatchNorm + Dropout(0.2)
                                          ↓
                                 Dense(2, Softmax)
                                          ↓
                                 Sentiment Output
                                 (Negative/Positive)
```

#### **Key Algorithmic Features:**

1. **Bidirectional LSTM (BiLSTM)**
   - Processes sequences in both forward and backward directions
   - Captures contextual information from entire sequence
   - Handles long-range dependencies

2. **Multi-Head Attention Mechanism**
   - 4 attention heads with key dimension of 32
   - Captures complex linguistic patterns
   - Focuses on important parts of the input

3. **Multi-Task Learning**
   - Shared feature extraction layers
   - Task-specific branches
   - Leverages relationship between sarcasm and sentiment
   - Loss weights: Sarcasm (0.4), Sentiment (0.6)

4. **Regularization Techniques**
   - Dropout layers (0.2-0.5 rates)
   - Batch Normalization
   - L2 regularization (via optimizer)

5. **Sarcasm-Aware Sentiment Interpretation**
   - **Critical Rule**: All sarcastic/ironic content classified as NEGATIVE
   - Provides both raw (literal) and final (corrected) sentiment
   - Confidence-adjusted predictions

#### **Hyperparameters:**

| Parameter | Value |
|-----------|-------|
| Vocabulary Size | 25,000 |
| Max Sequence Length | 120 tokens |
| Embedding Dimension | 200 (GloVe) |
| Batch Size | 32 |
| Learning Rate | 0.001 (Adam optimizer) |
| Max Epochs | 30 (with early stopping) |
| Early Stopping Patience | 10 epochs |
| Learning Rate Reduction | Factor: 0.5, Patience: 5 epochs |
| Dropout Rates | 0.2-0.5 (varies by layer) |
| Loss Function | Sparse Categorical Cross-entropy |

#### **Optimization Techniques:**
- **Adam Optimizer** - Adaptive learning rate
- **Early Stopping** - Prevents overfitting
- **Learning Rate Scheduling** - Reduces LR on plateau
- **Class Weights** - Handles class imbalance
- **Model Checkpointing** - Saves best model

---

### **2.2 Text Preprocessing Pipeline**

#### **Advanced Text Cleaning:**
1. **Normalization**
   - Lowercase conversion
   - Contraction expansion ("don't" → "do not")
   - Repeated character handling ("soooooo" → "sooo")

2. **Noise Removal**
   - URL removal
   - User mention replacement (`@user` → `<USER>`)
   - Hashtag word extraction (`#word` → `word`)
   - Special character cleanup

3. **Linguistic Preservation**
   - Maintains important markers
   - Preserves sentence structure
   - Keeps basic punctuation

4. **Tokenization & Sequencing**
   - Tokenizer with 25,000 word vocabulary
   - Out-of-vocabulary (OOV) token handling
   - Sequence padding/truncation to max_length=120

---

### **2.3 Product Search & Retrieval Algorithms**

#### **Database Query Algorithms:**
1. **Full-Text Search**
   - MySQL FULLTEXT indexes
   - Multi-field search (name, brand, category, description)
   - Relevance scoring

2. **Fuzzy Matching**
   - LIKE pattern matching
   - Case-insensitive search
   - Partial string matching

3. **Aggregation Algorithms**
   - Sentiment score averaging
   - Mention counting by sentiment type
   - Channel breakdown calculations

---

## 🛠️ **3. TOOLS & LIBRARIES**

### **3.1 Development Tools**

#### **Python Tools**
- **Python 3.8+** - Programming language
- **NumPy 1.23.0+** - Numerical computing
- **Pandas 1.5.0+** - Data manipulation and analysis
- **Scikit-learn 1.2.0+** - Machine learning utilities
  - Train-test splitting
  - Class weight computation
  - Performance metrics

#### **Data Visualization**
- **Matplotlib 3.6.0+** - Plotting library
- **Seaborn 0.12.0+** - Statistical visualization

#### **Utilities**
- **Requests 2.28.0+** - HTTP library (for downloading GloVe)
- **python-dotenv 1.1.1** - Environment variable management
- **python-multipart 0.0.20** - Multipart form data handling

### **3.2 Testing & Quality Assurance**
- **@testing-library/react 13.3.0** - React component testing
- **@testing-library/jest-dom 5.16.4** - Jest DOM matchers
- **@testing-library/user-event 13.5.0** - User interaction simulation

### **3.3 Build & Development Tools**
- **React Scripts 5.0.1** - Create React App scripts
- **ESLint** - JavaScript linting
- **Web Vitals 2.1.4** - Web performance metrics

---

## 📊 **4. DATASETS**

### **4.1 Sentiment Analysis Dataset**

#### **Training Data**
- **File:** `model/train.csv`
- **Format:** CSV with columns: `id, label, tweet`
- **Labels:**
  - `0` = Negative sentiment
  - `1` = Positive sentiment
- **Size:** ~32,000 training samples
- **Source:** Public sentiment analysis dataset
- **Domain:** Twitter/social media text

#### **Test Data**
- **File:** `model/test.csv`
- **Format:** CSV with columns: `id, label, tweet`
- **Labels:** Same as training (0 = Negative, 1 = Positive)
- **Size:** Variable (held-out test set)

---

### **4.2 Sarcasm/Irony Detection Dataset**

#### **Training Data**
- **File:** `model/archive/train.csv`
- **Format:** CSV with columns: `tweets, class`
- **Labels:**
  - `"figurative"` = Sarcastic/Ironic content
  - `"literal"` = Normal, non-sarcastic content
- **Size:** ~97,000 training samples
- **Source:** Public sarcasm/irony detection dataset

#### **Test Data**
- **File:** `model/archive/test.csv`
- **Format:** CSV with columns: `tweets, class`
- **Labels:** Same as training (figurative/literal)
- **Size:** Variable (held-out test set)

---

### **4.3 Combined Training Dataset**

#### **Dataset Merging Strategy:**
- **Sentiment Dataset:** Used for sentiment labels, assumed literal (sarcasm_label=0)
- **Sarcasm Dataset:** Used for both sarcasm detection and sentiment inference
  - Sarcastic tweets → Negative sentiment (critical rule)
  - Literal tweets → Sentiment inferred from keywords

#### **Final Combined Dataset:**
- **Total Size:** ~129,000 samples (combined)
- **Features:**
  - `clean_tweet` - Preprocessed text
  - `sentiment_label` - 0 (Negative) or 1 (Positive)
  - `sarcasm_label` - 0 (Literal) or 1 (Figurative)
- **Distribution:**
  - Balanced through class weights
  - Stratified train-validation split (80/20)

---

### **4.4 Product Database Dataset**

#### **Schema Tables:**
1. **Products Table**
   - Product information (name, brand, category, price, description)
   - SKU, URLs, images
   - Status tracking

2. **Sentiment Analysis Table**
   - Customer reviews and feedback
   - Sentiment scores (-1 to +1)
   - Confidence scores
   - Channel/platform information
   - Topics and keywords (JSON)

3. **Product Analytics Table**
   - Daily aggregated metrics
   - Mention counts by sentiment
   - Average sentiment scores
   - Channel breakdowns

4. **Product Pages Table**
   - Related URLs and platforms
   - Page types (product, review, social media)
   - Crawl metadata

#### **Sample Products:**
- iPhone 15 Pro (Apple)
- Samsung Galaxy S24
- MacBook Pro M3
- Tesla Model Y
- Nike Air Max 270

---

## 🔬 **5. TECHNIQUES & METHODOLOGIES**

### **5.1 Machine Learning Techniques**

#### **Multi-Task Learning**
- **Approach:** Shared feature extraction with task-specific branches
- **Benefits:**
  - Leverages related tasks (sarcasm + sentiment)
  - Improves generalization
  - Reduces overfitting
  - Better feature representation

#### **Transfer Learning**
- **Pre-trained Embeddings:** GloVe 200d word vectors
- **Freezing Strategy:** Embeddings frozen initially (trainable=False)
- **Benefits:**
  - Semantic understanding from large corpora
  - Better handling of out-of-vocabulary words
  - Reduced training time

#### **Attention Mechanism**
- **Type:** Multi-Head Self-Attention
- **Heads:** 4 attention heads
- **Key Dimension:** 32
- **Benefits:**
  - Captures long-range dependencies
  - Identifies important words/phrases
  - Improves context understanding

#### **Sequence Modeling**
- **Bidirectional Processing:** Forward + backward LSTM
- **Hierarchical Features:** 3 BiLSTM layers (128→64→32 units)
- **Benefits:**
  - Captures context from both directions
  - Hierarchical feature extraction
  - Better handling of sequential patterns

---

### **5.2 Text Processing Techniques**

#### **Advanced Preprocessing**
1. **Contraction Expansion**
   - Handles English contractions systematically
   - Improves tokenization accuracy

2. **Repeated Character Normalization**
   - Reduces character repetition (e.g., "soooooo" → "sooo")
   - Preserves emotional emphasis while normalizing

3. **URL and Mention Handling**
   - Removes URLs completely
   - Replaces user mentions with `<USER>` token
   - Extracts words from hashtags

4. **Noise Reduction**
   - Removes special characters
   - Preserves important punctuation
   - Handles whitespace normalization

#### **Tokenization Strategy**
- **Vocabulary Size:** 25,000 most frequent words
- **OOV Handling:** `<OOV>` token for unknown words
- **Padding:** Post-padding to max_length=120
- **Truncation:** Post-truncation for longer sequences

---

### **5.3 Model Training Techniques**

#### **Training Strategy:**
1. **Data Preparation**
   - Train-validation split: 80/20
   - Stratified sampling (by sarcasm label)
   - Shuffling with random seed (42)

2. **Class Imbalance Handling**
   - Computed class weights using scikit-learn
   - Balanced loss contribution

3. **Regularization**
   - Dropout at multiple layers
   - Batch normalization
   - Early stopping

4. **Optimization**
   - Adam optimizer with learning rate 0.001
   - Learning rate reduction on plateau
   - Model checkpointing

#### **Evaluation Metrics:**
- **Accuracy** - Overall classification correctness
- **Precision** - Positive predictive value (weighted)
- **Recall** - Sensitivity (weighted)
- **F1-Score** - Harmonic mean of precision and recall
- **Confusion Matrix** - Per-class performance visualization

---

### **5.4 System Architecture Techniques**

#### **Microservices Architecture**
- **Separate Services:**
  - Backend API (FastAPI) - AI and chat services
  - Database API - Data operations
  - Frontend (React) - User interface
  - Database (MySQL) - Data persistence

#### **Service Communication:**
- **HTTP/REST APIs** - Synchronous communication
- **Docker Networking** - Service discovery
- **Async/Await** - Non-blocking operations

#### **Caching Strategy:**
- **Redis Cache** - Session and query result caching
- **Database Query Optimization** - Indexed searches

#### **Error Handling:**
- **Graceful Degradation** - Fallback mechanisms
- **Retry Logic** - Connection retries (3 attempts)
- **Mock Responses** - Development/fallback mode

---

### **5.5 AI Integration Techniques**

#### **Google ADK Integration:**
- **Lazy Initialization** - Agent loaded on first use
- **Service Account Authentication** - Secure credential management
- **Error Fallbacks** - Mock agent for development

#### **Prompt Engineering:**
- **Structured Prompts** - Clear instructions and formatting
- **Context Injection** - Product data included in prompts
- **Response Formatting** - Markdown with sections

#### **Tool Integration:**
- **Product Lookup Tool** - Database access for AI
- **Automatic Product Detection** - Keyword extraction
- **Context-Aware Responses** - Data-driven insights

---

## 📈 **6. PERFORMANCE METRICS & EXPECTATIONS**

### **6.1 Model Performance Targets**

#### **Sarcasm Detection:**
- **Accuracy:** 75-85%
- **F1-Score:** 0.75-0.85
- **Precision/Recall:** Balanced performance

#### **Sentiment Analysis:**
- **Accuracy:** 80-90%
- **F1-Score:** 0.80-0.90
- **Improved Accuracy:** Better on sarcastic content (due to multi-task learning)

---

### **6.2 System Performance**

#### **Response Times:**
- **API Endpoints:** <500ms average
- **Database Queries:** <100ms average
- **AI Responses:** <5 seconds (with Gemini)
- **Frontend Load:** <2 seconds initial load

#### **Scalability:**
- **Horizontal Scaling:** Docker container-based
- **Load Balancing:** Nginx for production
- **Caching:** Redis for frequently accessed data
- **Database Indexing:** Optimized queries

---

## 🎯 **7. UNIQUE METHODOLOGICAL APPROACHES**

### **7.1 Sarcasm-Aware Sentiment Analysis**
- **Novel Approach:** Treating all sarcasm as negative sentiment
- **Rationale:** Sarcasm typically expresses negative sentiment through positive words
- **Implementation:** Multi-task model with sarcasm branch informing sentiment branch

### **7.2 Multi-Task Learning Architecture**
- **Shared Feature Extraction:** Single BiLSTM backbone
- **Task-Specific Branches:** Specialized outputs for each task
- **Loss Weighting:** Optimized balance between tasks (0.4 sarcasm, 0.6 sentiment)

### **7.3 Real-Time Product Analysis**
- **Dynamic Product Lookup:** AI agent queries database in real-time
- **Context Integration:** Product data injected into AI prompts
- **Structured Responses:** Markdown-formatted analysis with specific sections

---

## 📚 **8. ADDITIONAL RESOURCES**

### **8.1 Documentation Files**
- `model/README.md` - Detailed model documentation
- `backend/README.md` - API documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `PRODUCT_LOOKUP_TOOL.md` - Tool documentation
- `ARCHITECTURE_DIAGRAMS.md` - System architecture

### **8.2 Configuration Files**
- `docker-compose.yml` - Service orchestration
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies
- `.env.example` - Environment variables template

---

## ✅ **9. SUMMARY**

This methodology combines:
- **Modern Web Technologies:** React 18, FastAPI, MySQL
- **Advanced Deep Learning:** Multi-task BiLSTM with attention
- **State-of-the-Art AI:** Google Gemini 2.0 Flash
- **Pre-trained Embeddings:** GloVe 200d word vectors
- **Comprehensive Datasets:** ~129K combined samples
- **Production-Ready Architecture:** Microservices, Docker, caching
- **Sarcasm-Aware Analysis:** Novel approach to sentiment interpretation

The system is designed for scalability, maintainability, and high performance in production environments.

---

**Document Version:** 1.0  
**Last Updated:** 2025  
**Project:** BrandPulse - Sentiment Analysis Dashboard



