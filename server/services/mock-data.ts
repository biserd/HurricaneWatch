// Current Hurricane Erin data based on NHC reports (Aug 19, 2025)
export const mockHurricaneData = {
  features: [
    {
      type: "Feature",
      properties: {
        STORMNAME: "Hurricane Erin",
        MAXWIND: 130, // 130 mph - Category 4
        MSLP: 945,     // Minimum central pressure
        TCDIRECTION: "NW",
        TCSPEED: 12,   // Forward speed 12 mph
        SYNOPTIC: new Date().toISOString(),
        INTENSITY: "Category 4 Hurricane",
        STATUS: "Active - passing east of Bahamas"
      },
      geometry: {
        type: "Point",
        coordinates: [-69.3, 22.3] // Current NHC position
      }
    }
  ]
};

export const mockStormCones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        STORMNAME: "Hurricane Demo Alpha",
        STORMTYPE: "HU",
        INTENSITY: "Cat 3"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-80.5, 24.2], [-76.5, 24.2], [-76.0, 28.5], [-81.0, 28.5], [-80.5, 24.2]
        ]]
      }
    }
  ]
};

export const mockStormTracks = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        STORMNAME: "Hurricane Demo Alpha",
        FORECASTER: "NHC"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-78.5, 26.2], [-79.1, 27.0], [-79.8, 27.9], [-80.4, 28.7]
        ]
      }
    }
  ]
};

export const mockWarnings = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        EVENTTYPE: "Hurricane Warning",
        AREA: "Southeast Florida Coast"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-80.5, 25.0], [-80.0, 25.0], [-80.0, 26.5], [-80.5, 26.5], [-80.5, 25.0]
        ]]
      }
    }
  ]
};