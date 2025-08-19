// KML parser for authentic NHC hurricane data
export class KMLParser {
  static parseNHCActiveData(kmlText: string): any[] {
    const hurricanes: any[] = [];
    
    // Extract folders that contain storm data using simple regex
    const folderRegex = /<Folder[^>]*id="[^"]*"[^>]*>([\s\S]*?)<\/Folder>/g;
    let folderMatch;
    
    while ((folderMatch = folderRegex.exec(kmlText)) !== null) {
      const folderContent = folderMatch[1];
      
      // Look for ExtendedData with tc: namespace (storm data)
      const tcDataMatch = folderContent.match(/<ExtendedData[^>]*tc[^>]*>([\s\S]*?)<\/ExtendedData>/);
      if (!tcDataMatch) continue;
      
      const tcData = tcDataMatch[1];
      
      // Extract storm information
      const name = this.extractValue(tcData, 'tc:name');
      const type = this.extractValue(tcData, 'tc:type');
      const lat = parseFloat(this.extractValue(tcData, 'tc:centerLat') || '0');
      const lon = parseFloat(this.extractValue(tcData, 'tc:centerLon') || '0');
      const dateTime = this.extractValue(tcData, 'tc:dateTime');
      const movement = this.extractValue(tcData, 'tc:movement');
      const pressure = this.extractValue(tcData, 'tc:minimumPressure');
      const windSpeed = this.extractValue(tcData, 'tc:maxSustainedWind');
      const atcfId = this.extractValue(tcData, 'tc:atcfID');
      
      if (name && lat && lon) {
        hurricanes.push({
          name: `${type === 'HU' ? 'Hurricane' : type === 'TS' ? 'Tropical Storm' : 'Tropical Depression'} ${name}`,
          atcfId,
          category: this.categorizeByWind(parseInt(windSpeed?.replace(/[^\d]/g, '') || '0')),
          windSpeed: parseInt(windSpeed?.replace(/[^\d]/g, '') || '0'),
          pressure: parseInt(pressure?.replace(/[^\d]/g, '') || '0'),
          latitude: lat,
          longitude: lon,
          movement: movement || 'Unknown',
          lastUpdate: this.parseDateTime(dateTime),
          nextUpdate: new Date(Date.now() + 6 * 60 * 60 * 1000), // +6 hours
          isActive: true,
          type,
          rawData: {
            dateTime,
            pressure,
            windSpeed,
            movement
          }
        });
      }
    }
    
    return hurricanes;
  }
  
  private static extractValue(text: string, tag: string): string | null {
    const match = text.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
    return match ? match[1].trim() : null;
  }
  
  private static categorizeByWind(windSpeed: number): string {
    if (windSpeed >= 157) return "Category 5 Hurricane";
    if (windSpeed >= 130) return "Category 4 Hurricane";
    if (windSpeed >= 111) return "Category 3 Hurricane";
    if (windSpeed >= 96) return "Category 2 Hurricane";
    if (windSpeed >= 74) return "Category 1 Hurricane";
    if (windSpeed >= 39) return "Tropical Storm";
    return "Tropical Depression";
  }
  
  private static parseDateTime(dateTime: string | null): Date {
    if (!dateTime) return new Date();
    
    try {
      // Handle NHC format like "8:00 PM EDT Mon Aug 18"
      const currentYear = new Date().getFullYear();
      const dateWithYear = `${dateTime} ${currentYear}`;
      return new Date(dateWithYear);
    } catch {
      return new Date();
    }
  }
}