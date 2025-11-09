import requests
from bs4 import BeautifulSoup
import json
import csv

urls = ["https://www.toyota.com/corollacross/","https://www.toyota.com/rav4/","https://www.toyota.com/rav4pluginhybrid/","https://www.toyota.com/bz/"
,"https://www.toyota.com/highlander/","https://www.toyota.com/grandhighlander/","https://www.toyota.com/4runner/","https://www.toyota.com/crownsignia/","https://www.toyota.com/landcruiser/","https://www.toyota.com/sequoia/"
,"https://www.toyota.com/corolla/","https://www.toyota.com/corollahatchback/","https://www.toyota.com/prius/","https://www.toyota.com/priuspluginhybrid/","https://www.toyota.com/camry/"
,"https://www.toyota.com/gr86/","https://www.toyota.com/grcorolla/","https://www.toyota.com/grsupra/"
,"https://www.toyota.com/sienna/","https://www.toyota.com/crown/","https://www.toyota.com/mirai/","https://www.toyota.com/tacoma/"
,"https://www.toyota.com/tundra/"]

def flatten_dict(d, parent_key='', sep='_'):
    """Flatten a nested dictionary"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        elif isinstance(v, list):
            # Convert list to string representation
            items.append((new_key, json.dumps(v) if v else ''))
        else:
            items.append((new_key, v))
    return dict(items)

def extract_json_data(soup):
    """Extract all data from data-modal-content-json attributes"""
    all_data = []
    
    # Find all elements with data-modal-content-json attribute
    elements = soup.find_all(attrs={"data-modal-content-json": True})
    
    for element in elements:
        json_str = element.get('data-modal-content-json')
        if json_str:
            try:
                # Parse JSON string
                data = json.loads(json_str)
                
                # Extract base model name from data-series attribute and trim from data-aa-series-grade
                # Check the element itself first, then parent elements and their children
                base_model = None
                trim_name = None
                
                # Check current element
                if element.get('data-series'):
                    base_model = element.get('data-series')
                if element.get('data-aa-series-grade'):
                    trim_name = element.get('data-aa-series-grade')
                
                # If not found, check parent elements and search within parent containers
                if not base_model or not trim_name:
                    parent = element.parent
                    # Check up to 5 levels of parents
                    for _ in range(5):
                        if not parent:
                            break
                        
                        # Check parent element directly
                        if not base_model and parent.get('data-series'):
                            base_model = parent.get('data-series')
                        if not trim_name and parent.get('data-aa-series-grade'):
                            trim_name = parent.get('data-aa-series-grade')
                        
                        # If still not found, search within this parent's children
                        if not base_model:
                            series_elem = parent.find(attrs={"data-series": True})
                            if series_elem:
                                base_model = series_elem.get('data-series')
                        if not trim_name:
                            trim_elem = parent.find(attrs={"data-aa-series-grade": True})
                            if trim_elem:
                                trim_name = trim_elem.get('data-aa-series-grade')
                        
                        # Also check siblings if we have a grandparent
                        if parent.parent and (not base_model or not trim_name):
                            if not base_model:
                                for sibling in parent.parent.find_all(attrs={"data-series": True}, limit=1):
                                    base_model = sibling.get('data-series')
                                    break
                            if not trim_name:
                                for sibling in parent.parent.find_all(attrs={"data-aa-series-grade": True}, limit=1):
                                    trim_name = sibling.get('data-aa-series-grade')
                                    break
                        
                        # Move to next level up
                        parent = parent.parent
                        if base_model and trim_name:
                            break
                
                # If data is a list, process each item
                if isinstance(data, list):
                    for item in data:
                        record = {}
                        if isinstance(item, dict):
                            record = flatten_dict(item)
                        else:
                            record = {'value': item}
                        
                        # Add base model and trim name to each record
                        record['base_model'] = base_model if base_model else ''
                        record['trim_name'] = trim_name if trim_name else ''
                        
                        all_data.append(record)
                # If data is a dict, flatten it
                elif isinstance(data, dict):
                    record = flatten_dict(data)
                    record['base_model'] = base_model if base_model else ''
                    record['trim_name'] = trim_name if trim_name else ''
                    all_data.append(record)
                # If it's a primitive value, wrap it
                else:
                    record = {'value': data}
                    record['base_model'] = base_model if base_model else ''
                    record['trim_name'] = trim_name if trim_name else ''
                    all_data.append(record)
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {e}")
                print(f"JSON string: {json_str[:100]}...")
                continue
    
    return all_data

def write_to_csv(data, filename='toyota_data.csv'):
    """Write extracted data to CSV file"""
    if not data:
        print("No data to write to CSV")
        return
    
    # Get all unique keys from all records
    all_keys = set()
    for record in data:
        all_keys.update(record.keys())
    
    # Sort keys for consistent column order, but prioritize base_model and trim_name
    priority_keys = ['base_model', 'trim_name', 'source_url']
    other_keys = sorted([k for k in all_keys if k not in priority_keys])
    
    # Put priority keys first, then others
    fieldnames = priority_keys + other_keys
    
    # Write to CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Data written to {filename}")
    print(f"Total records: {len(data)}")
    print(f"Columns: {len(fieldnames)}")

# Collect all data from all URLs
all_data = []

for url in urls:
    print(f"Scraping {url}...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        content = response.content
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract data from this page
        page_data = extract_json_data(soup)
        print(f"  Found {len(page_data)} records")
        
        # Add URL to each record for tracking
        for record in page_data:
            record['source_url'] = url
        
        all_data.extend(page_data)
    except Exception as e:
        print(f"  Error scraping {url}: {e}")
        continue

# Write all data to CSV
write_to_csv(all_data, 'toyota_modal_data.csv')
print(f"\nScraping complete! Total records collected: {len(all_data)}")