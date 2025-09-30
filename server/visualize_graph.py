"""Visualize the graph using Mermaid and display it as an image."""

from PIL import Image
import io

from agent import graph

graph.get_graph().print_ascii()

image_bytes = graph.get_graph(xray=True).draw_mermaid_png()
image = Image.open(io.BytesIO(image_bytes))
image.show()
