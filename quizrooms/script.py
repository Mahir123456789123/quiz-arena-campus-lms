import csv
import random

CSV_HEADER = ['room', 'question', 'option1', 'option2', 'option3', 'option4', 'answer']
CSV_FILE = 'questions.csv'

TOPICS = [
    "Operating Systems",
    "Algorithms",
    "Computer Networks",
    "Data Structures",
    "Python Programming",
    "Database Management",
    "Discrete Mathematics",
    "Computer Organization",
    "Software Engineering",
    "Theory of Computation"
]

QUESTION_TEMPLATES = {
    "Operating Systems": [
        ("What is the main purpose of the {component}?", 
         ["Process management", "Memory allocation", "I/O operations", "User interface"], 
         [0, 1, 2]),
        ("Which scheduling algorithm uses {characteristic}?", 
         ["FCFS", "Round Robin", "Priority Scheduling", "Shortest Job First"], 
         [0, 1, 2, 3]),
        ("In {concept}, what does {term} refer to?", 
         ["Kernel structure", "Process state", "Memory page", "File descriptor"], 
         [0, 1, 2, 3])
    ],
    "Algorithms": [
        ("What is the time complexity of {algorithm}?", 
         ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 
         [2, 3, 2, 3]),
        ("Which algorithm uses {approach} approach?", 
         ["Divide and Conquer", "Greedy", "Dynamic Programming", "Backtracking"], 
         [0, 1, 2, 3]),
        ("What data structure is optimal for {operation}?", 
         ["Hash Table", "Binary Tree", "Graph", "Stack"], 
         [0, 1, 2, 3])
    ],
    "Computer Networks": [
        ("Which layer handles {function} in the OSI model?", 
         ["Physical", "Data Link", "Network", "Transport"], 
         [1, 2, 3, 3]),
        ("What protocol is used for {purpose}?", 
         ["TCP", "UDP", "HTTP", "FTP"], 
         [0, 1, 2, 3]),
        ("What does {acronym} stand for?", 
         ["Transmission Control Protocol", "User Datagram Protocol", 
          "File Transfer Protocol", "Internet Protocol"], 
         [0, 1, 2, 3])
    ],
    "Data Structures": [
        ("Which structure uses {principle} principle?", 
         ["FIFO", "LIFO", "Hierarchical", "Graph-based"], 
         [0, 1, 2, 3]),
        ("What is the worst-case time for {operation} in {structure}?", 
         ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 
         [2, 3, 2, 3]),
        ("Which data structure is best for {use_case}?", 
         ["Hash Table", "Binary Search Tree", "Graph", "Queue"], 
         [0, 1, 2, 3])
    ],
    "Python Programming": [
        ("What does {method} do in Python?", 
         ["List manipulation", "String formatting", "File I/O", "Exception handling"], 
         [0, 1, 2, 3]),
        ("Which module is used for {purpose}?", 
         ["os", "sys", "math", "datetime"], 
         [0, 1, 2, 3]),
        ("What is the output of {code_snippet}?", 
         ["Error", "None", "Expected output", "TypeError"], 
         [0, 1, 2, 3])
    ],
    "Database Management": [
        ("Which normal form addresses {issue}?", 
         ["1NF", "2NF", "3NF", "BCNF"], 
         [1, 2, 3, 3]),
        ("What does {term} mean in SQL?", 
         ["JOIN", "VIEW", "INDEX", "TRIGGER"], 
         [0, 1, 2, 3]),
        ("Which command is used for {operation}?", 
         ["SELECT", "UPDATE", "DELETE", "ALTER"], 
         [0, 1, 2, 3])
    ],
    # Added templates for other topics
    "Discrete Mathematics": [
        ("What is the {property} of {concept}?", 
         ["Commutative", "Associative", "Distributive", "Identity"], 
         [0, 1, 2, 3]),
        ("Which {concept} is used for {application}?", 
         ["Graph Theory", "Set Theory", "Logic", "Combinatorics"], 
         [0, 1, 2, 3])
    ],
    "Computer Organization": [
        ("What is the function of {component}?", 
         ["ALU", "Control Unit", "Register", "Cache"], 
         [0, 1, 2, 3]),
        ("Which architecture uses {feature}?", 
         ["Harvard", "Von Neumann", "RISC", "CISC"], 
         [0, 1, 2, 3])
    ],
    "Software Engineering": [
        ("Which methodology uses {approach}?", 
         ["Agile", "Waterfall", "Spiral", "DevOps"], 
         [0, 1, 2, 3]),
        ("What is the purpose of {artifact}?", 
         ["UML Diagram", "SRS Document", "Test Cases", "Code Review"], 
         [0, 1, 2, 3])
    ],
    "Theory of Computation": [
        ("Which automaton recognizes {language}?", 
         ["DFA", "NFA", "PDA", "Turing Machine"], 
         [0, 1, 2, 3]),
        ("What is the complexity class of {problem}?", 
         ["P", "NP", "NP-Complete", "Undecidable"], 
         [0, 1, 2, 3])
    ]
}

def generate_question(topic):
    """Generate a single question for given topic"""
    template, options, answers = random.choice(QUESTION_TEMPLATES[topic])
    
    # Dictionary of all possible placeholders
    format_dict = {
        'component': random.choice(["scheduler", "memory manager", "file system"]),
        'characteristic': random.choice(["first-come-first-served", "time slicing", "priority-based"]),
        'term': random.choice(["semaphore", "mutex", "page table"]),
        'algorithm': random.choice(["Bubble Sort", "Merge Sort", "Quick Sort"]),
        'approach': random.choice(["divide and conquer", "greedy", "dynamic programming"]),
        'operation': random.choice(["insertion", "search", "deletion"]),
        'function': random.choice(["error detection", "routing", "reliable delivery"]),
        'purpose': random.choice(["file transfer", "web browsing", "email"]),
        'acronym': random.choice(["TCP", "UDP", "HTTP", "FTP"]),
        'principle': random.choice(["FIFO", "LIFO", "hierarchical"]),
        'use_case': random.choice(["symbol tables", "priority queues", "network routing"]),
        'method': random.choice([".append()", ".format()", "open()", "try-except"]),
        'code_snippet': random.choice(["5 ** 2", "'hello'.upper()", "len([1,2,3])"]),
        'issue': random.choice(["partial dependencies", "transitive dependencies", "multi-valued dependencies"]),
        'term_db': random.choice(["ACID", "CRUD", "ORM"]),
        'operation_db': random.choice(["data retrieval", "data modification", "schema changes"]),
        'concept': random.choice(["binary relations", "graph theory", "set operations"]),
        'application': random.choice(["network analysis", "database optimization", "system design"]),
        'property': random.choice(["commutative", "associative", "distributive"]),
        'component': random.choice(["ALU", "Control Unit", "Register"]),
        'feature': random.choice(["separate data/cache", "stored program", "reduced instruction set"]),
        'approach': random.choice(["iterative development", "strict phases", "risk analysis"]),
        'artifact': random.choice(["class diagram", "sequence diagram", "use case diagram"]),
        'language': random.choice(["regular", "context-free", "recursive"]),
        'problem': random.choice(["sorting", "traveling salesman", "halting problem"])
    }
    
    question = template.format(**format_dict)
    
    answer_idx = random.choice(answers)
    answer = str(answer_idx + 1)
    
    # Shuffle options while keeping track of correct answer
    options_with_idx = list(zip(options, [1,2,3,4]))
    random.shuffle(options_with_idx)
    shuffled_options = [opt[0] for opt in options_with_idx]
    answer = str([opt[1] for opt in options_with_idx if opt[0] == options[answer_idx]][0])
    
    return {
        'room': topic,
        'question': question,
        'option1': shuffled_options[0],
        'option2': shuffled_options[1],
        'option3': shuffled_options[2],
        'option4': shuffled_options[3],
        'answer': answer
    }

def generate_questions():
    """Generate 10 questions per topic"""
    questions = []
    for topic in TOPICS:
        for _ in range(10):  # Changed from 100 to 10
            questions.append(generate_question(topic))
    
    # Write to CSV
    try:
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=CSV_HEADER)
            writer.writeheader()
            writer.writerows(questions)
        print(f"Generated {len(questions)} questions in {CSV_FILE}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_questions()
