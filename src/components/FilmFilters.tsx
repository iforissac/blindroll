'use client';

export default function FilmFilters() {
  return (
    <svg className="hidden">
      <defs>
        {/* Kodak Portra 400: 溫暖、降低綠色飽和、柔和高光 */}
        <filter id="kodak-portra">
          <feColorMatrix type="matrix" values="
            1.12, 0.05, -0.05, 0, 0.05
            0.02, 1.08, 0.02, 0, 0.02
            -0.05, 0.05, 1.05, 0, -0.05
            0, 0, 0, 1, 0" 
          />
        </filter>

        {/* Kodak Tri-X 400: 硬核黑白、高對比、壓縮灰階 */}
        <filter id="kodak-trix">
          <feColorMatrix type="matrix" values="
            0.33, 0.33, 0.33, 0, 0
            0.33, 0.33, 0.33, 0, 0
            0.33, 0.33, 0.33, 0, 0
            0, 0, 0, 1, 0" 
          />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 0.1 0.3 0.6 0.9 1" />
            <feFuncG type="discrete" tableValues="0 0.1 0.3 0.6 0.9 1" />
            <feFuncB type="discrete" tableValues="0 0.1 0.3 0.6 0.9 1" />
          </feComponentTransfer>
        </filter>

        {/* Fuji Superia 400: 偏綠/青色調、陰影偏紫色 */}
        <filter id="fuji-superia">
          <feColorMatrix type="matrix" values="
            0.9, 0.1, 0.1, 0, 0
            0.1, 1.1, 0.1, 0, -0.05
            0, 0.1, 1.2, 0, 0.05
            0, 0, 0, 1, 0" 
          />
        </filter>

        {/* Kodak Gold 200: 強烈暖黃色、高對比、復古感 */}
        <filter id="kodak-gold">
          <feColorMatrix type="matrix" values="
            1.2, 0.1, 0.1, 0, 0.05
            0.1, 1.1, 0, 0, 0.05
            -0.1, -0.1, 0.9, 0, -0.05
            0, 0, 0, 1, 0" 
          />
        </filter>

        {/* Fuji Velvia: 極高飽和度、深藍色陰影 */}
        <filter id="fuji-velvia">
          <feColorMatrix type="matrix" values="
            1.3, -0.1, -0.1, 0, 0
            -0.1, 1.3, -0.1, 0, 0
            -0.1, -0.1, 1.5, 0, 0
            0, 0, 0, 1, 0" 
          />
        </filter>
      </defs>
    </svg>
  );
}
