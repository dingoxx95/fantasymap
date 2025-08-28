# Fantasy Map

An interactive visualization of influence networks between fantasy, sci-fi, and RPG works.

## Description

Fantasy Map is a web application that displays connections and influences between:
- Fantasy and science fiction literature
- Role-playing games and board games
- Video games
- Cinema and TV
- Comics
- Mythology

## Features

- **Interactive visualization**: Navigable graph with zoom and pan
- **Category filters**: Show/hide specific types of works
- **Search functionality**: Quickly find specific works
- **Multiple layouts**: Different graph arrangement algorithms
- **Responsive design**: Works on desktop and mobile devices
- **Export capability**: Save the graph as PNG image

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**:
  - [Cytoscape.js](https://cytoscape.org/) - Graph visualization
  - [Dagre](https://github.com/dagrejs/dagre) - Hierarchical layout
  - [jQuery](https://jquery.com/) - DOM manipulation

## Project Structure

```
fantasymap/
├── index.html              # Main page
├── README.md               # Documentation
├── site.webmanifest       # PWA manifest
├── src/
│   ├── css/
│   │   └── style.css      # CSS styles
│   └── js/
│       └── script.js      # JavaScript logic
└── srv/
    └── data.json          # Graph data
```

## How to Use

1. Open `index.html` in a modern web browser
2. Use the controls in the top bar to:
   - Search for specific works
   - Apply category filters
   - Change graph layout
   - Fit view
3. Use the side filters to customize the visualization
4. Click and drag to navigate the graph
5. Use mouse wheel to zoom in/out

## Local Installation

1. Clone or download the repository
2. Set up a local web server (e.g., XAMPP, WAMP, or Python server)
3. Navigate to `http://localhost/fantasymap/`

Alternatively, simply open `index.html` directly in your browser (some features may be limited).

## Supported Browsers

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

This project is distributed under the absolutely no License.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests for improvements and bug fixes.