from bs4 import BeautifulSoup
import requests
import json
import sys

# url = 'https://codeforces.com/contest/1826/problem/A'
# url = 'https://codeforces.com/contest/1826/problem/B'

url = sys.argv[1]

try:
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://codeforces.com/"
    }
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)

soup = BeautifulSoup(response.text, 'html.parser')

# everything that matters is in this class
problem_statements = soup.find_all(class_='problem-statement')

#print(problem_statements)

for statement in problem_statements:
    # title
    title = statement.find(class_='title').text.strip()
    
    # time limit
    time_limit = statement.find(class_='time-limit').text.strip().replace('time limit per test', '')
    
    # memory limit
    memory_limit = statement.find(class_='memory-limit').text.strip().replace('memory limit per test', '')
    
    # input format
    input_spec = statement.find(class_='input-specification').text.strip().replace('Input', '')
    # print("Input Specification:", input_spec)
    
    # output format
    output_spec = statement.find(class_='output-specification').text.strip().replace('Output', '')
    # print("Output Specification:", output_spec)
    
    legend = statement.find('div', class_='legend')
    problem = ""
    if legend:
        problem = legend.get_text('\n', strip=True)

    examples = statement.find('div', class_='sample-tests')
    inputs = []
    outputs = []
    if examples:
        for sample in examples.find_all('div', class_='sample-test'):
            input_div = sample.find('div', class_='input')
            output_div = sample.find('div', class_='output')
            if input_div:
                pre = input_div.find('pre')
                if pre:
                    inputs.append(pre.get_text('\n', strip=True))
            if output_div:
                pre = output_div.find('pre')
                if pre:
                    outputs.append(pre.get_text('\n', strip=True))

    sample_input = "\n\n".join(inputs)
    sample_outputs = "\n\n".join(outputs)
    
    note = statement.find(class_='note')
    notes = ""

    if note:
        note_text = note.text.strip().replace('Note', '')
        notes += note_text
        # print("Note:", note_text)
    
    data = {
        "title": title,
        "time_limit": time_limit,
        "memory_limit": memory_limit,
        "input_format": input_spec,
        "output_format": output_spec,
        "statement": problem,
        "sample_input": sample_input,
        "sample_outputs": sample_outputs,
        "note": notes
    }

    try:
        json_data = json.dumps(data, indent=0)
        print(json_data)
    except Exception as e:
        print(f"Error: Failed to serialize data to JSON: {e}")
        # exit(1)