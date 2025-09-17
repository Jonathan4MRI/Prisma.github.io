# HTML Content Extraction Results

This directory contains the results of extracting content from 12 HTML files from the Neuroscape Wiki.

## Files Generated

- **`extract_html_content.py`** - Python script for extracting content from HTML files
- **`extracted_content.json`** - Complete extracted content (450KB)
- **`README_extraction.md`** - This documentation file

## Extraction Summary

- **Total Pages Processed:** 12
- **Total Content Extracted:** 24,730 characters of clean text
- **Total Media References:** 94 (images, videos, downloads)
- **Total Associated Files:** 375 files in _files directories
- **Total Structured Elements:** 61 headings, 5 tables, 600 lists

## Pages Included

1. **Child MRI prep video and scanner sounds and tips** - Guide for preparing children for MRI scans
2. **DICOM Transfer Guide** - Instructions for transferring DICOM files
3. **Filming at the NIC** - Video recording procedures at the imaging center
4. **MRGlasses** - Guide for MR-compatible glasses and vision correction
5. **NNL** - Information about the Neural Networks Lab
6. **Neuroscape Imaging Core UCSF** - Main landing page for the imaging core
7. **Neuroscape Scanner Lists** - Lists of available scanners and equipment
8. **Prisma Reboot Startup** - Procedures for scanner startup and shutdown
9. **Scanner Troubleshooting Guide** - Common scanner issues and solutions
10. **Siemens Audio Systems Guide** - Audio system setup and troubleshooting
11. **fMRI Equipment Troubleshooting** - Functional MRI equipment issues
12. **fORP** - Guide for fiber optic response pad system

## JSON Structure

The `extracted_content.json` file contains:

```json
{
  "extraction_info": {
    "base_directory": "/path/to/files",
    "total_files": 12,
    "extraction_timestamp": "2025-09-10T14:40:31.239770"
  },
  "pages": {
    "page_name": {
      "filename": "original_filename.html",
      "title": "Page Title",
      "main_content": "Clean text content...",
      "structured_content": {
        "lists": [...],
        "tables": [...],
        "code_blocks": [...],
        "headings": [...]
      },
      "media_references": [
        {
          "type": "image|video|download",
          "src": "path/to/file",
          "alt": "alt text",
          "local_path": "/full/path/to/local/file",
          "context": "surrounding text context"
        }
      ],
      "associated_files": [
        {
          "filename": "file.ext",
          "relative_path": "path/file.ext",
          "full_path": "/full/path/file.ext",
          "size": 12345,
          "mime_type": "image/png",
          "extension": ".png"
        }
      ],
      "meta_tags": {...},
      "file_size": 123456,
      "processing_timestamp": "2025-09-10T14:40:31.239770"
    }
  }
}
```

## File Types Cataloged

- **JavaScript files:** 207 (.js)
- **CSS files:** 75 (.css)
- **SVG images:** 24 (.svg)
- **Logo files:** 24 (.logo)
- **JPEG images:** 12 (.jpg)
- **PNG images:** 9 (.png)
- **GIF images:** 12 (.gif)
- **Other files:** 12 (no extension)

## Usage

The extracted data can be used to:

1. **Recreate the website** - All text content and media references are preserved
2. **Content analysis** - Structured data enables easy analysis of content
3. **Migration** - Clean format suitable for importing into other systems
4. **Search and indexing** - Text content is clean and searchable
5. **Asset management** - Complete catalog of all associated files

## Script Features

The extraction script provides:

- **Clean text extraction** - Removes HTML tags and navigation elements
- **Structured content preservation** - Maintains lists, tables, and headings
- **Media cataloging** - Identifies and catalogs all images and media files
- **File association** - Links content to associated _files directories
- **Context preservation** - Maintains relationship between content and media
- **Metadata extraction** - Captures page titles, meta tags, and file information

## Running the Script

```bash
python3 extract_html_content.py [directory_path]
```

If no directory is specified, it uses the current working directory.

## Requirements

- Python 3.6+
- BeautifulSoup4 (`pip install beautifulsoup4`)

---

Generated on: 2025-09-10T14:40:31.239770