import numpy as np
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer


def read_pdf(pdf_path):
    text_per_page = {}
    for pagenum, page in enumerate(extract_pages(pdf_path)):
        page_content = []
        page_elements = [element for element in page._objs]
        for element in page_elements:
            if isinstance(element, LTTextContainer):
                line_text = element.get_text()
                page_content.append(line_text)  
        text_per_page[pagenum] = ''.join(page_content)
    return ''.join(text_per_page.values())

pdf_path1 = 'DSL.pdf'

text1 = read_pdf(pdf_path1)
print(text1)
