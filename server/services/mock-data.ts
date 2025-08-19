// Mock data for demonstration when external APIs are unavailable
export const mockHurricaneData = {
  features: [
    {
      type: "Feature",
      properties: {
        STORMNAME: "Hurricane Demo Alpha",
        MAXWIND: 125,
        MSLP: 945,
        TCDIRECTION: "NW",
        TCSPEED: 12,
        SYNOPTIC: new Date().toISOString()
      },
      geometry: {
        type: "Point",
        coordinates: [-78.5, 26.2]
      }
    },
    {
      type: "Feature",
      properties: {
        STORMNAME: "Tropical Storm Beta",
        MAXWIND: 65,
        MSLP: 990,
        TCDIRECTION: "N",
        TCSPEED: 8,
        SYNOPTIC: new Date().toISOString()
      },
      geometry: {
        type: "Point",
        coordinates: [-85.1, 23.8]
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