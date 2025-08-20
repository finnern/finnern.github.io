import os
import re
import html
import yaml
from datetime import datetime
import xml.etree.ElementTree as ET

# Define the WordPress XML namespace
namespaces = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
    'dc': 'http://purl.org/dc/elements/1.1/'
}

# Output directory for Jekyll posts
output_dir = '_posts'
os.makedirs(output_dir, exist_ok=True)

# Function to process WordPress content
def process_wordpress_content(content):
    # Replace WordPress shortcodes
    content = re.sub(r'\[caption.*?\](.*?)\[/caption\]', r'\1', content)
    content = re.sub(r'\[gallery.*?\]', '', content)
    
    # Convert WordPress specific HTML to markdown or clean HTML
    content = re.sub(r'<pre.*?>(.*?)</pre>', r'```\n\1\n```', content, flags=re.DOTALL)
    
    # Handle special characters
    content = content.replace('&nbsp;', ' ')
    
    return content

# Function to process media URLs
def process_media_urls(content):
    # Update image URLs to point to the new Jekyll site structure
    content = re.sub(
        r'http(s?)://finnern\.com/wp-content/uploads/(\d+)/(\d+)/(.*?)\.(jpg|jpeg|png|gif)',
        r'/assets/images/\2/\3/\4.\5',
        content
    )
    return content

# Parse WordPress export XML
tree = ET.parse('feed.xml')
root = tree.getroot()

# Find all posts
items = root.findall('.//item')
post_count = 0

for item in items:
    # Check if this is a post
    post_type = item.find('./wp:post_type', namespaces)
    post_status = item.find('./wp:status', namespaces)
    
    # Only process published posts
    if post_type is not None and post_type.text == 'post' and post_status is not None and post_status.text == 'publish':
        # Extract post information
        title = item.find('./title').text
        if title is None:
            title = "Untitled Post"
        
        content = item.find('./content:encoded', namespaces).text
        if content is None:
            content = ""
        
        date = item.find('./wp:post_date', namespaces).text
        post_name = item.find('./wp:post_name', namespaces).text
        
        # Get categories
        categories = []
        for category in item.findall('./category'):
            if category.get('domain') == 'category':
                categories.append(category.text)
        
        # Format date for Jekyll
        post_date = datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
        jekyll_date = post_date.strftime('%Y-%m-%d')
        
        # Process content
        content = process_wordpress_content(content)
        content = process_media_urls(content)
        
        # Create Jekyll frontmatter
        frontmatter = {
            'layout': 'post',
            'title': title,
            'date': date,
            'categories': categories
        }
        
        # Create filename for Jekyll post
        if post_name:
            filename = f"{jekyll_date}-{post_name}.md"
        else:
            # Create a slug from the title if post_name is not available
            slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')
            filename = f"{jekyll_date}-{slug}.md"
        
        # Create the Jekyll post file
        with open(os.path.join(output_dir, filename), 'w', encoding='utf-8') as f:
            f.write('---\n')
            f.write(yaml.dump(frontmatter, default_flow_style=False))
            f.write('---\n\n')
            f.write(content)
        
        post_count += 1
        print(f"Processed: {filename}")

print(f"Converted {post_count} posts successfully.")