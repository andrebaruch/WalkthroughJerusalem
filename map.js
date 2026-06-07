// Map initialisation
mapboxgl.accessToken = 'PASTE_YOUR_MAPBOX_TOKEN_HERE';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [35.2332, 31.7767],  // Jerusalem Old City
  zoom: 16
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl());

// When the map loads, add the building layer
map.on('load', () => {

  // Add a highlight layer for clicked buildings
  map.addSource('selected-building', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  });

  map.addLayer({
    id: 'selected-building-fill',
    type: 'fill',
    source: 'selected-building',
    paint: {
      'fill-color': '#C4952A',
      'fill-opacity': 0.6
    }
  });
});

// Handle building clicks
map.on('click', (e) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['building']
  });

  const sidebar = document.getElementById('property-info');
  const instructions = document.getElementById('instructions');

  if (features.length > 0) {
    const building = features[0];

    // Highlight the clicked building
    map.getSource('selected-building').setData({
      type: 'FeatureCollection',
      features: [building]
    });

    // Show placeholder info in sidebar
    document.getElementById('property-name').textContent =
      building.properties.name || 'Unnamed Building';
    document.getElementById('property-history').textContent =
      'OSM ID: ' + (building.id || 'unknown') + '\n\nNo historical record yet. This is where your content will appear.';

    sidebar.style.display = 'block';
    instructions.style.display = 'none';

  } else {
    // Click on empty area — reset
    map.getSource('selected-building').setData({
      type: 'FeatureCollection',
      features: []
    });
    sidebar.style.display = 'none';
    instructions.style.display = 'block';
  }
});

// Change cursor on building hover
map.on('mouseenter', 'building', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'building', () => {
  map.getCanvas().style.cursor = '';
});