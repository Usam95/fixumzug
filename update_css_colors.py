import re
import time

def update_css_colors():
    # File paths
    palette_file = 'color-palette.txt'
    css_file = 'web/css/styles.css'

    # Step 1: Read the colors from color-palette.txt
    with open(palette_file, 'r') as file:
        color_line = file.readline().strip()
        colors = color_line.split('-')

    # Step 2: Generate CSS variable definitions
    color_variables = [
        f'    --color-{i + 1}: #{color};' for i, color in enumerate(colors)
    ]
    color_variables.append("--color-6: #ffffff");
    color_variables_css = ':root {\n' + '\n'.join(color_variables) + '\n}'

    # Step 3: Read the existing CSS file and update the :root section
    with open(css_file, 'r') as file:
        css_content = file.read()

    # Check if there's an existing :root section
    root_pattern = r':root\s*{[^}]*}'
    if re.search(root_pattern, css_content):
        # Replace the existing :root section with the new one
        css_content = re.sub(root_pattern, color_variables_css, css_content)
    else:
        # If there's no :root section, add it at the beginning of the file
        css_content = color_variables_css + '\n\n' + css_content

    # Step 4: Write the updated CSS back to the file
    with open(css_file, 'w') as file:
        file.write(css_content)

    print("CSS variables updated successfully!")


# Run the update function every 5 seconds
while True:
    update_css_colors()
    time.sleep(5)
    break
