# Resume Skill Gap Analyzer

A Python-based application that compares a candidate's resume with a job description and identifies skill gaps using Natural Language Processing (NLP) techniques.

## Features

- **Text Preprocessing**: Cleans, tokenizes, and removes stop words from input texts
- **Skill Extraction**: Identifies technical and soft skills using a comprehensive skill dictionary
- **Gap Analysis**: Compares resume skills with job requirements
- **Match Scoring**: Calculates similarity using TF-IDF vectorization and cosine similarity
- **Learning Recommendations**: Provides personalized learning resources for missing skills
- **Detailed Reporting**: Generates comprehensive, user-friendly analysis reports

## Requirements

### Python Version
- Python 3.7 or higher

### Dependencies
```
nltk>=3.8.0
scikit-learn>=1.3.0
```

## Installation

1. Install the required dependencies:
```bash
pip install nltk scikit-learn
```

2. The script will automatically download required NLTK data on first run.

## Usage

### Running the Application

```bash
python scripts/resume_skill_gap_analyzer.py
```

### Input Methods

The application supports two input methods for both resume and job description:

1. **Paste Text**: Directly paste your text into the console
   - After pasting, press Enter, then Ctrl+D (Unix/Mac) or Ctrl+Z (Windows)

2. **Read from File**: Provide the file path to read text from a file
   - Example: `resume.txt` or `/path/to/resume.txt`

### Sample Workflow

```
1. Choose input method for resume (paste or file)
2. Provide resume text
3. Choose input method for job description (paste or file)
4. Provide job description text
5. View comprehensive analysis report
6. Optionally save report to file
```

## Output

The analyzer provides:

- **Summary Statistics**: Overall match score, total skills, matched skills, skill gap
- **Matched Skills**: Skills present in both resume and job description
- **Missing Skills**: Skills required but not in resume (your skill gap)
- **Additional Skills**: Extra skills in resume not mentioned in job description
- **Top 5 Relevant Skills**: Most important skills from the job description
- **Learning Recommendations**: Resources to learn missing skills

## Example Report

```
================================================================================
                      RESUME SKILL GAP ANALYSIS REPORT                        
================================================================================

📊 SUMMARY STATISTICS
--------------------------------------------------------------------------------
Overall Match Score:          67.5%
Total Skills in Resume:       12
Total Skills Required:        15
Skills Matched:               8
Skills Gap:                   7

✅ MATCHED SKILLS
--------------------------------------------------------------------------------
  1. python
  2. javascript
  3. react
  ...

❌ MISSING SKILLS (SKILL GAP)
--------------------------------------------------------------------------------
  1. aws
  2. docker
  3. kubernetes
  ...

💡 LEARNING RECOMMENDATIONS
--------------------------------------------------------------------------------
  1. AWS
     Category: Cloud
     Resource: AWS Training, Azure Learn, Google Cloud Skills Boost
  ...
```

## Technical Details

### Preprocessing Pipeline
1. Convert text to lowercase
2. Remove punctuation and special characters
3. Tokenize text into words
4. Remove English stop words
5. Filter tokens (minimum length: 3 characters)

### Skill Dictionary
The application includes 100+ predefined skills across categories:
- Programming Languages (Python, Java, JavaScript, etc.)
- Web Technologies (React, Angular, Node.js, etc.)
- Databases (MySQL, MongoDB, PostgreSQL, etc.)
- Cloud & DevOps (AWS, Docker, Kubernetes, etc.)
- Data Science & ML (TensorFlow, pandas, scikit-learn, etc.)
- Soft Skills (Communication, Leadership, etc.)

### Similarity Algorithm
- Uses TF-IDF (Term Frequency-Inverse Document Frequency) vectorization
- Calculates cosine similarity between resume and job description vectors
- Provides match percentage (0-100%)

## Error Handling

The application handles:
- Empty or invalid input texts
- Missing files
- Missing dependencies (graceful degradation)
- Invalid user choices

## Customization

You can customize the skill dictionary by modifying the `SKILL_DICTIONARY` set in the script:

```python
SKILL_DICTIONARY = {
    'your_skill_1',
    'your_skill_2',
    # Add more skills...
}
```

## Academic Context

This application demonstrates:
- Object-Oriented Programming (OOP) with Python classes
- Natural Language Processing (NLP) techniques
- Machine Learning concepts (TF-IDF, cosine similarity)
- Modular code design and separation of concerns
- Error handling and input validation
- Documentation and code comments

## License

This project is created for academic evaluation purposes.
