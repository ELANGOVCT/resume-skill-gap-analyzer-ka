"""
Resume Skill Gap Analyzer
A Python application that compares a candidate's resume with a job description
and identifies skill gaps using NLP techniques.
"""

import re
import string
from collections import Counter
from typing import List, Dict, Set, Tuple
import json

# Core NLP and ML libraries
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt_tab', quiet=True)
except ImportError:
    print("Warning: NLTK not available. Using basic text processing.")
    
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    print("Warning: scikit-learn not available. Match percentage will be basic.")

# Comprehensive skill dictionary with technical and soft skills
SKILL_DICTIONARY = {
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 
    'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'sql',
    
    # Web Technologies
    'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 
    'flask', 'spring', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
    
    # Databases
    'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'cassandra', 
    'dynamodb', 'sqlite', 'mariadb', 'elasticsearch', 'neo4j',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 
    'ansible', 'ci/cd', 'git', 'github', 'gitlab', 'bitbucket',
    
    # Data Science & ML
    'machine learning', 'deep learning', 'neural networks', 'tensorflow', 
    'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 
    'data analysis', 'data visualization', 'nlp', 'computer vision',
    
    # Soft Skills
    'communication', 'leadership', 'teamwork', 'problem solving', 
    'critical thinking', 'time management', 'adaptability', 'creativity',
    'collaboration', 'presentation', 'analytical', 'organizational',
    
    # Methodologies & Practices
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'tdd', 'bdd',
    'microservices', 'api', 'rest', 'graphql', 'oauth', 'jwt',
    
    # Tools & Frameworks
    'jira', 'confluence', 'slack', 'vs code', 'intellij', 'eclipse',
    'postman', 'swagger', 'figma', 'adobe', 'photoshop',
}


class TextPreprocessor:
    """Handles text preprocessing tasks including cleaning, tokenization, and normalization."""
    
    def __init__(self):
        """Initialize the preprocessor with stopwords."""
        try:
            self.stop_words = set(stopwords.words('english'))
        except:
            # Fallback to basic English stop words if NLTK not available
            self.stop_words = {
                'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 
                'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
                'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
                'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
                'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'been', 'being',
                'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
                'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of',
                'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
                'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
                'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
            }
    
    def clean_text(self, text: str) -> str:
        """
        Clean text by removing special characters and normalizing whitespace.
        
        Args:
            text: Raw input text
            
        Returns:
            Cleaned text in lowercase
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Keep alphanumeric, spaces, and some special chars like +, #, .
        text = re.sub(r'[^a-z0-9\s+#./]', ' ', text)
        
        # Normalize whitespace
        text = ' '.join(text.split())
        
        return text
    
    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into words.
        
        Args:
            text: Input text
            
        Returns:
            List of tokens
        """
        try:
            # Use NLTK tokenizer if available
            tokens = word_tokenize(text)
        except:
            # Fallback to simple split
            tokens = text.split()
        
        return tokens
    
    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """
        Remove stop words from token list.
        
        Args:
            tokens: List of word tokens
            
        Returns:
            Filtered list without stop words
        """
        return [token for token in tokens if token not in self.stop_words and len(token) > 2]
    
    def preprocess(self, text: str) -> List[str]:
        """
        Full preprocessing pipeline: clean, tokenize, and remove stop words.
        
        Args:
            text: Raw input text
            
        Returns:
            List of processed tokens
        """
        cleaned = self.clean_text(text)
        tokens = self.tokenize(cleaned)
        filtered = self.remove_stopwords(tokens)
        return filtered


class SkillExtractor:
    """Extracts technical and soft skills from text using a skill dictionary."""
    
    def __init__(self, skill_dict: Set[str]):
        """
        Initialize with a skill dictionary.
        
        Args:
            skill_dict: Set of skills to look for
        """
        self.skill_dict = skill_dict
        # Create variations for better matching
        self.skill_variations = self._create_skill_variations()
    
    def _create_skill_variations(self) -> Dict[str, str]:
        """
        Create normalized versions of skills for better matching.
        
        Returns:
            Dictionary mapping normalized skill names to canonical forms
        """
        variations = {}
        for skill in self.skill_dict:
            # Normalize: remove spaces, dots, slashes
            normalized = skill.replace(' ', '').replace('.', '').replace('/', '')
            variations[normalized] = skill
            variations[skill] = skill  # Also keep original
        return variations
    
    def extract_skills(self, tokens: List[str], original_text: str = "") -> Set[str]:
        """
        Extract skills from tokenized text and original text.
        
        Args:
            tokens: Preprocessed tokens
            original_text: Original text (for multi-word skills)
            
        Returns:
            Set of found skills
        """
        found_skills = set()
        
        # Search in tokens (single-word skills)
        for token in tokens:
            normalized = token.replace('.', '').replace('/', '')
            if normalized in self.skill_variations:
                found_skills.add(self.skill_variations[normalized])
        
        # Search for multi-word skills in original text
        original_lower = original_text.lower()
        for skill in self.skill_dict:
            if ' ' in skill or '.' in skill:
                # Multi-word skill or skill with dots (e.g., "machine learning", "node.js")
                if skill in original_lower:
                    found_skills.add(skill)
        
        return found_skills


class SkillGapAnalyzer:
    """Main analyzer class that compares resume with job description."""
    
    def __init__(self):
        """Initialize the analyzer with preprocessor and skill extractor."""
        self.preprocessor = TextPreprocessor()
        self.skill_extractor = SkillExtractor(SKILL_DICTIONARY)
    
    def calculate_match_percentage(self, resume_text: str, job_desc_text: str) -> float:
        """
        Calculate similarity between resume and job description using TF-IDF and cosine similarity.
        
        Args:
            resume_text: Resume text
            job_desc_text: Job description text
            
        Returns:
            Match percentage (0-100)
        """
        try:
            # Use TF-IDF vectorization
            vectorizer = TfidfVectorizer(max_features=500)
            tfidf_matrix = vectorizer.fit_transform([resume_text, job_desc_text])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Convert to percentage
            return round(similarity * 100, 2)
        except:
            # Fallback: simple word overlap calculation
            resume_words = set(resume_text.lower().split())
            job_words = set(job_desc_text.lower().split())
            
            if not job_words:
                return 0.0
            
            overlap = len(resume_words & job_words)
            percentage = (overlap / len(job_words)) * 100
            return round(percentage, 2)
    
    def analyze(self, resume_text: str, job_desc_text: str) -> Dict:
        """
        Perform complete skill gap analysis.
        
        Args:
            resume_text: Candidate's resume text
            job_desc_text: Job description text
            
        Returns:
            Dictionary with analysis results
        """
        # Validate inputs
        if not resume_text or not resume_text.strip():
            raise ValueError("Resume text cannot be empty")
        if not job_desc_text or not job_desc_text.strip():
            raise ValueError("Job description text cannot be empty")
        
        # Preprocess texts
        resume_tokens = self.preprocessor.preprocess(resume_text)
        job_tokens = self.preprocessor.preprocess(job_desc_text)
        
        # Extract skills
        resume_skills = self.skill_extractor.extract_skills(resume_tokens, resume_text)
        job_skills = self.skill_extractor.extract_skills(job_tokens, job_desc_text)
        
        # Compare skills
        matched_skills = resume_skills & job_skills
        missing_skills = job_skills - resume_skills
        extra_skills = resume_skills - job_skills
        
        # Calculate match percentage
        match_percentage = self.calculate_match_percentage(resume_text, job_desc_text)
        
        # Get top 5 most relevant skills from job description
        # Skills that appear more frequently or are matched get priority
        top_skills = sorted(job_skills, key=lambda x: (
            1 if x in matched_skills else 0,
            job_desc_text.lower().count(x)
        ), reverse=True)[:5]
        
        # Generate learning recommendations for missing skills
        recommendations = self._generate_recommendations(missing_skills)
        
        return {
            'matched_skills': sorted(matched_skills),
            'missing_skills': sorted(missing_skills),
            'extra_skills': sorted(extra_skills),
            'match_percentage': match_percentage,
            'top_relevant_skills': top_skills,
            'recommendations': recommendations,
            'total_resume_skills': len(resume_skills),
            'total_job_skills': len(job_skills),
            'match_count': len(matched_skills),
        }
    
    def _generate_recommendations(self, missing_skills: Set[str]) -> List[Dict[str, str]]:
        """
        Generate learning recommendations for missing skills.
        
        Args:
            missing_skills: Set of skills not found in resume
            
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        # Priority learning resources by skill category
        learning_resources = {
            'programming': 'Online courses: Coursera, Udemy, freeCodeCamp',
            'web': 'MDN Web Docs, Frontend Masters, The Odin Project',
            'database': 'SQL tutorials, MongoDB University, database documentation',
            'cloud': 'AWS Training, Azure Learn, Google Cloud Skills Boost',
            'data_science': 'Kaggle, DataCamp, fast.ai courses',
            'soft_skill': 'LinkedIn Learning, soft skills workshops, practice projects',
        }
        
        for skill in sorted(missing_skills)[:10]:  # Top 10 priority
            # Categorize skill
            category = self._categorize_skill(skill)
            resource = learning_resources.get(category, 'Online tutorials and documentation')
            
            recommendations.append({
                'skill': skill,
                'category': category,
                'resource': resource
            })
        
        return recommendations
    
    def _categorize_skill(self, skill: str) -> str:
        """Categorize a skill into learning resource category."""
        skill_lower = skill.lower()
        
        if any(lang in skill_lower for lang in ['python', 'java', 'javascript', 'c++', 'ruby']):
            return 'programming'
        elif any(tech in skill_lower for tech in ['html', 'css', 'react', 'angular', 'vue']):
            return 'web'
        elif any(db in skill_lower for db in ['sql', 'mysql', 'mongodb', 'database']):
            return 'database'
        elif any(cloud in skill_lower for cloud in ['aws', 'azure', 'gcp', 'cloud']):
            return 'cloud'
        elif any(ds in skill_lower for ds in ['machine learning', 'data', 'analysis', 'tensorflow']):
            return 'data_science'
        elif any(soft in skill_lower for soft in ['communication', 'leadership', 'teamwork']):
            return 'soft_skill'
        else:
            return 'general'


class ReportGenerator:
    """Generates user-friendly analysis reports."""
    
    @staticmethod
    def generate_console_report(analysis: Dict) -> str:
        """
        Generate a formatted console report.
        
        Args:
            analysis: Analysis results dictionary
            
        Returns:
            Formatted report string
        """
        report = []
        report.append("=" * 80)
        report.append("RESUME SKILL GAP ANALYSIS REPORT".center(80))
        report.append("=" * 80)
        report.append("")
        
        # Summary statistics
        report.append("📊 SUMMARY STATISTICS")
        report.append("-" * 80)
        report.append(f"Overall Match Score:          {analysis['match_percentage']}%")
        report.append(f"Total Skills in Resume:       {analysis['total_resume_skills']}")
        report.append(f"Total Skills Required:        {analysis['total_job_skills']}")
        report.append(f"Skills Matched:               {analysis['match_count']}")
        report.append(f"Skills Gap:                   {len(analysis['missing_skills'])}")
        report.append("")
        
        # Matched skills
        report.append("✅ MATCHED SKILLS")
        report.append("-" * 80)
        if analysis['matched_skills']:
            for i, skill in enumerate(analysis['matched_skills'], 1):
                report.append(f"  {i}. {skill}")
        else:
            report.append("  No matching skills found.")
        report.append("")
        
        # Missing skills (skill gap)
        report.append("❌ MISSING SKILLS (SKILL GAP)")
        report.append("-" * 80)
        if analysis['missing_skills']:
            for i, skill in enumerate(analysis['missing_skills'], 1):
                report.append(f"  {i}. {skill}")
        else:
            report.append("  No missing skills! You have all required skills.")
        report.append("")
        
        # Extra skills
        report.append("➕ ADDITIONAL SKILLS IN RESUME")
        report.append("-" * 80)
        if analysis['extra_skills']:
            for i, skill in enumerate(analysis['extra_skills'], 1):
                report.append(f"  {i}. {skill}")
        else:
            report.append("  No additional skills beyond job requirements.")
        report.append("")
        
        # Top 5 relevant skills
        report.append("🎯 TOP 5 MOST RELEVANT SKILLS FROM JOB DESCRIPTION")
        report.append("-" * 80)
        for i, skill in enumerate(analysis['top_relevant_skills'], 1):
            status = "✓ Have" if skill in analysis['matched_skills'] else "✗ Need"
            report.append(f"  {i}. {skill:<30} [{status}]")
        report.append("")
        
        # Learning recommendations
        if analysis['recommendations']:
            report.append("💡 LEARNING RECOMMENDATIONS")
            report.append("-" * 80)
            for i, rec in enumerate(analysis['recommendations'][:5], 1):  # Top 5
                report.append(f"  {i}. {rec['skill'].upper()}")
                report.append(f"     Category: {rec['category'].replace('_', ' ').title()}")
                report.append(f"     Resource: {rec['resource']}")
                report.append("")
        
        report.append("=" * 80)
        report.append("End of Report".center(80))
        report.append("=" * 80)
        
        return "\n".join(report)
    
    @staticmethod
    def save_report_to_file(report: str, filename: str = "skill_gap_analysis.txt"):
        """
        Save report to a text file.
        
        Args:
            report: Report text
            filename: Output filename
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"\n✅ Report saved to: {filename}")
        except Exception as e:
            print(f"\n❌ Error saving report: {e}")


def read_from_file(filename: str) -> str:
    """
    Read text from a file.
    
    Args:
        filename: Path to file
        
    Returns:
        File contents as string
    """
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"File not found: {filename}")
    except Exception as e:
        raise Exception(f"Error reading file: {e}")


def main():
    """Main function to run the Resume Skill Gap Analyzer application."""
    
    print("=" * 80)
    print("RESUME SKILL GAP ANALYZER".center(80))
    print("=" * 80)
    print()
    
    try:
        # Get resume input
        print("📄 RESUME INPUT")
        print("-" * 80)
        print("Choose input method:")
        print("  1. Paste resume text")
        print("  2. Read from file")
        
        resume_choice = input("\nEnter choice (1 or 2): ").strip()
        
        if resume_choice == '1':
            print("\nPaste your resume text (press Enter, then Ctrl+D on Unix or Ctrl+Z on Windows when done):")
            import sys
            resume_text = sys.stdin.read()
        elif resume_choice == '2':
            resume_file = input("\nEnter resume file path: ").strip()
            resume_text = read_from_file(resume_file)
            print("✅ Resume loaded successfully!")
        else:
            print("❌ Invalid choice. Exiting.")
            return
        
        print()
        
        # Get job description input
        print("📋 JOB DESCRIPTION INPUT")
        print("-" * 80)
        print("Choose input method:")
        print("  1. Paste job description text")
        print("  2. Read from file")
        
        job_choice = input("\nEnter choice (1 or 2): ").strip()
        
        if job_choice == '1':
            print("\nPaste job description text (press Enter, then Ctrl+D on Unix or Ctrl+Z on Windows when done):")
            import sys
            job_text = sys.stdin.read()
        elif job_choice == '2':
            job_file = input("\nEnter job description file path: ").strip()
            job_text = read_from_file(job_file)
            print("✅ Job description loaded successfully!")
        else:
            print("❌ Invalid choice. Exiting.")
            return
        
        print()
        print("🔄 Analyzing... Please wait.")
        print()
        
        # Perform analysis
        analyzer = SkillGapAnalyzer()
        results = analyzer.analyze(resume_text, job_text)
        
        # Generate and display report
        report_gen = ReportGenerator()
        report = report_gen.generate_console_report(results)
        print(report)
        
        # Ask to save report
        save_choice = input("\n💾 Save report to file? (y/n): ").strip().lower()
        if save_choice == 'y':
            filename = input("Enter filename (default: skill_gap_analysis.txt): ").strip()
            if not filename:
                filename = "skill_gap_analysis.txt"
            report_gen.save_report_to_file(report, filename)
        
        print("\n✨ Analysis complete!")
        
    except ValueError as e:
        print(f"\n❌ Input Error: {e}")
    except FileNotFoundError as e:
        print(f"\n❌ File Error: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
