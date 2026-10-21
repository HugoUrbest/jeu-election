// Rend une page de PDF en PNG avec PDFKit (JXA) : osascript -l JavaScript render-pdf.js in.pdf out.png largeur [page] [transparent]
ObjC.import('Cocoa');
ObjC.import('Quartz');

function run(argv) {
  const [input, output, widthArg, pageArg, background] = argv;
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(input));
  const page = doc.pageAtIndex(Number(pageArg || 0));
  const box = page.boundsForBox($.kPDFDisplayBoxMediaBox);
  const width = Number(widthArg);
  const scale = width / box.size.width;
  const height = Math.round(box.size.height * scale);

  const space = $.CGColorSpaceCreateWithName($.kCGColorSpaceSRGB);
  const ctx = $.CGBitmapContextCreate(null, width, height, 8, 0, space, $.kCGImageAlphaPremultipliedLast);
  if (background !== 'transparent') {
    $.CGContextSetRGBFillColor(ctx, 1, 1, 1, 1);
    $.CGContextFillRect(ctx, $.CGRectMake(0, 0, width, height));
  }
  $.CGContextSetInterpolationQuality(ctx, $.kCGInterpolationHigh);
  $.CGContextScaleCTM(ctx, scale, scale);
  $.CGContextTranslateCTM(ctx, -box.origin.x, -box.origin.y);
  page.drawWithBoxToContext($.kPDFDisplayBoxMediaBox, ctx);

  const image = $.CGBitmapContextCreateImage(ctx);
  const rep = $.NSBitmapImageRep.alloc.initWithCGImage(image);
  const data = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
  data.writeToFileAtomically(output, true);
  return `${output} ${width}x${height} (page ${box.size.width}x${box.size.height} pt)`;
}
