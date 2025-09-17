#!/usr/bin/env python3
"""
HTML Content Extraction Script
Extracts and organizes content from HTML files and their associated _files directories.
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse
import mimetypes

try:
    from bs4 import BeautifulSoup, NavigableString
except ImportError:
    print("BeautifulSoup4 is required. Install with: pip install beautifulsoup4")
    exit(1)

class HTMLContentExtractor:
    def __init__(self, base_directory: str):
        self.base_directory = Path(base_directory)
        self.output_data = {}
        
    def get_html_files(self) -> List[Path]:
        """Find all HTML files in the base directory."""
        html_files = []
        for file_path in self.base_directory.glob("*.html"):
            html_files.append(file_path)
        return sorted(html_files)
    
    def get_associated_files_dir(self, html_file: Path) -> Optional[Path]:
        """Get the associated _files directory for an HTML file."""
        files_dir_name = html_file.stem + "_files"
        files_dir = self.base_directory / files_dir_name
        return files_dir if files_dir.exists() else None
    
    def extract_text_content(self, element) -> str:
        """Extract clean text content from a BeautifulSoup element."""
        if isinstance(element, NavigableString):
            return str(element).strip()
        
        # Handle different content types
        text_parts = []
        for child in element.children:
            if child.name in ['script', 'style', 'meta', 'link']:
                continue
            if isinstance(child, NavigableString):
                text = str(child).strip()
                if text:
                    text_parts.append(text)
            else:
                child_text = self.extract_text_content(child)
                if child_text:
                    text_parts.append(child_text)
        
        return ' '.join(text_parts)
    
    def extract_structured_content(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract structured content like lists, tables, and code blocks."""
        structured = {
            "lists": [],
            "tables": [],
            "code_blocks": [],
            "headings": []
        }
        
        # Extract lists
        for ul in soup.find_all(['ul', 'ol']):
            list_items = []
            for li in ul.find_all('li', recursive=False):
                list_items.append(self.extract_text_content(li))
            if list_items:
                structured["lists"].append({
                    "type": ul.name,
                    "items": list_items
                })
        
        # Extract tables
        for table in soup.find_all('table'):
            table_data = []
            rows = table.find_all('tr')
            for row in rows:
                row_data = []
                cells = row.find_all(['td', 'th'])
                for cell in cells:
                    row_data.append(self.extract_text_content(cell))
                if row_data:
                    table_data.append(row_data)
            if table_data:
                structured["tables"].append(table_data)
        
        # Extract code blocks
        for code in soup.find_all(['code', 'pre']):
            code_text = self.extract_text_content(code)
            if code_text:
                structured["code_blocks"].append(code_text)
        
        # Extract headings
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            structured["headings"].append({
                "level": heading.name,
                "text": self.extract_text_content(heading)
            })
        
        return structured
    
    def extract_media_references(self, soup: BeautifulSoup, html_file: Path) -> List[Dict[str, Any]]:
        """Extract references to images and other media files."""
        media_refs = []
        
        # Extract images
        for img in soup.find_all('img'):
            src = img.get('src', '')
            alt = img.get('alt', '')
            title = img.get('title', '')
            
            # Try to find the actual file
            local_path = None
            if src:
                # Handle relative paths
                if not src.startswith(('http://', 'https://')):
                    # Check if it's in the _files directory
                    files_dir = self.get_associated_files_dir(html_file)
                    if files_dir:
                        potential_file = files_dir / Path(src).name
                        if potential_file.exists():
                            local_path = str(potential_file)
            
            media_refs.append({
                "type": "image",
                "src": src,
                "alt": alt,
                "title": title,
                "local_path": local_path,
                "context": self.get_element_context(img)
            })
        
        # Extract other media (videos, audio, etc.)
        for media in soup.find_all(['video', 'audio', 'source']):
            src = media.get('src', '')
            if src:
                media_refs.append({
                    "type": media.name,
                    "src": src,
                    "context": self.get_element_context(media)
                })
        
        # Extract links to downloadable files
        for link in soup.find_all('a'):
            href = link.get('href', '')
            if href:
                # Check if it's a file download
                parsed = urlparse(href)
                if parsed.path:
                    file_ext = Path(parsed.path).suffix.lower()
                    if file_ext in ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar']:
                        media_refs.append({
                            "type": "download",
                            "href": href,
                            "text": self.extract_text_content(link),
                            "file_type": file_ext,
                            "context": self.get_element_context(link)
                        })
        
        return media_refs
    
    def get_element_context(self, element) -> str:
        """Get the surrounding context of an element."""
        # Try to find the parent paragraph or container
        parent = element.find_parent(['p', 'div', 'section', 'article', 'td', 'th'])
        if parent:
            return self.extract_text_content(parent)[:200]  # First 200 chars
        return ""
    
    def catalog_files_directory(self, files_dir: Path) -> List[Dict[str, Any]]:
        """Catalog all files in a _files directory."""
        files_catalog = []
        
        if not files_dir.exists():
            return files_catalog
        
        for file_path in files_dir.rglob('*'):
            if file_path.is_file():
                # Get file info
                stat = file_path.stat()
                mime_type, _ = mimetypes.guess_type(str(file_path))
                
                files_catalog.append({
                    "filename": file_path.name,
                    "relative_path": str(file_path.relative_to(files_dir)),
                    "full_path": str(file_path),
                    "size": stat.st_size,
                    "mime_type": mime_type,
                    "extension": file_path.suffix.lower()
                })
        
        return sorted(files_catalog, key=lambda x: x['filename'])
    
    def extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract the main content text from the page."""
        # Try to find the main content area
        main_content_selectors = [
            '#content',
            '#main-content',
            'main',
            '.content',
            '.main-content',
            'article',
            '.wiki-content',
            '.page-content'
        ]
        
        main_content = None
        for selector in main_content_selectors:
            element = soup.select_one(selector)
            if element:
                main_content = element
                break
        
        # If no main content found, use body
        if not main_content:
            main_content = soup.find('body')
        
        # Remove navigation, header, footer, sidebar elements
        if main_content:
            # Clone to avoid modifying original
            content_copy = BeautifulSoup(str(main_content), 'html.parser')
            
            # Remove unwanted elements
            unwanted_selectors = [
                'nav', 'header', 'footer', 'aside',
                '.nav', '.navigation', '.header', '.footer', '.sidebar',
                '.menu', '.breadcrumb', '.search', '.meta',
                'script', 'style', 'link', 'meta'
            ]
            
            for selector in unwanted_selectors:
                for element in content_copy.select(selector):
                    element.decompose()
            
            return self.extract_text_content(content_copy)
        
        return ""
    
    def process_html_file(self, html_file: Path) -> Dict[str, Any]:
        """Process a single HTML file and extract all content."""
        print(f"Processing: {html_file.name}")
        
        try:
            with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {html_file}: {e}")
            return None
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract basic metadata
        title = ""
        title_tag = soup.find('title')
        if title_tag:
            title = self.extract_text_content(title_tag)
        
        # Extract main content
        main_text = self.extract_main_content(soup)
        
        # Extract structured content
        structured = self.extract_structured_content(soup)
        
        # Extract media references
        media = self.extract_media_references(soup, html_file)
        
        # Get associated files directory
        files_dir = self.get_associated_files_dir(html_file)
        files_catalog = self.catalog_files_directory(files_dir) if files_dir else []
        
        # Extract meta tags
        meta_tags = {}
        for meta in soup.find_all('meta'):
            name = meta.get('name') or meta.get('property') or meta.get('http-equiv')
            content = meta.get('content')
            if name and content:
                meta_tags[name] = content
        
        return {
            "filename": html_file.name,
            "title": title,
            "main_content": main_text,
            "structured_content": structured,
            "media_references": media,
            "files_directory": str(files_dir) if files_dir else None,
            "associated_files": files_catalog,
            "meta_tags": meta_tags,
            "file_size": html_file.stat().st_size,
            "processing_timestamp": None  # Will be set when saved
        }
    
    def extract_all_content(self) -> Dict[str, Any]:
        """Extract content from all HTML files."""
        html_files = self.get_html_files()
        print(f"Found {len(html_files)} HTML files")
        
        extracted_data = {
            "extraction_info": {
                "base_directory": str(self.base_directory),
                "total_files": len(html_files),
                "extraction_timestamp": None  # Will be set when saved
            },
            "pages": {}
        }
        
        for html_file in html_files:
            page_data = self.process_html_file(html_file)
            if page_data:
                # Use filename as key (without .html extension)
                page_key = html_file.stem
                extracted_data["pages"][page_key] = page_data
        
        return extracted_data
    
    def save_results(self, data: Dict[str, Any], output_file: str = "extracted_content.json"):
        """Save extracted data to JSON file."""
        from datetime import datetime
        
        # Add timestamps
        timestamp = datetime.now().isoformat()
        data["extraction_info"]["extraction_timestamp"] = timestamp
        
        for page_data in data["pages"].values():
            page_data["processing_timestamp"] = timestamp
        
        output_path = self.base_directory / output_file
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"\nExtraction complete!")
            print(f"Results saved to: {output_path}")
            print(f"Total pages processed: {len(data['pages'])}")
            
            # Print summary
            print("\nSummary:")
            for page_key, page_data in data["pages"].items():
                print(f"  - {page_data['title'][:50]}...")
                print(f"    Content length: {len(page_data['main_content'])} chars")
                print(f"    Media files: {len(page_data['media_references'])}")
                print(f"    Associated files: {len(page_data['associated_files'])}")
                print()
            
            return output_path
            
        except Exception as e:
            print(f"Error saving results: {e}")
            return None


def main():
    """Main function to run the extraction."""
    import sys
    
    # Get base directory from command line or use current directory
    if len(sys.argv) > 1:
        base_dir = sys.argv[1]
    else:
        base_dir = os.getcwd()
    
    if not os.path.exists(base_dir):
        print(f"Directory not found: {base_dir}")
        sys.exit(1)
    
    print(f"Extracting content from HTML files in: {base_dir}")
    
    # Create extractor and run
    extractor = HTMLContentExtractor(base_dir)
    extracted_data = extractor.extract_all_content()
    
    # Save results
    output_file = extractor.save_results(extracted_data)
    
    if output_file:
        print(f"\nExtraction completed successfully!")
        print(f"Output file: {output_file}")
    else:
        print("Extraction failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()