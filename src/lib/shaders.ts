export const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

export const FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform sampler2D u_lookupTable;
  uniform bool u_shouldInvert;
  varying vec2 v_texCoord;

  void main() {
    vec4 rawColor = texture2D(u_image, v_texCoord);
    vec3 color = rawColor.rgb;
    
    // 如果是 Negative LUT，則在映射前先執行反向
    if (u_shouldInvert) {
      color = 1.0 - color;
    }
    
    float blueColor = color.b * 63.0;
    
    vec2 quad1;
    quad1.y = floor(floor(blueColor) / 8.0);
    quad1.x = floor(blueColor) - (quad1.y * 8.0);
    
    vec2 quad2;
    quad2.y = floor(ceil(blueColor) / 8.0);
    quad2.x = ceil(blueColor) - (quad2.y * 8.0);
    
    vec2 texPos1;
    texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * color.r);
    texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * color.g);
    
    vec2 texPos2;
    texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * color.r);
    texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * color.g);
    
    vec4 newColor1 = texture2D(u_lookupTable, texPos1);
    vec4 newColor2 = texture2D(u_lookupTable, texPos2);
    
    vec4 finalColor = mix(newColor1, newColor2, fract(blueColor));
    gl_FragColor = vec4(finalColor.rgb, rawColor.a);
  }
`;
