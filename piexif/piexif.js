import  piexif  from 'piexifjs';

function handleFileSelect(evt) {
    var file = evt.target.files[0];


    var zeroth = {};
    var exif = {};
    var gps = {};
    zeroth[piexif.ImageIFD.Make] = "Make";
    zeroth[piexif.ImageIFD.XResolution] = [777, 1];
    zeroth[piexif.ImageIFD.YResolution] = [777, 1];
    zeroth[piexif.ImageIFD.Software] = "Piexifjs";
    exif[piexif.ExifIFD.DateTimeOriginal] = "2010:10:10 10:10:10";
    exif[piexif.ExifIFD.LensMake] = "LensMake";
    exif[piexif.ExifIFD.Sharpness] = 777;
    exif[piexif.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]];
    gps[piexif.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
    gps[piexif.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";
    var exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};
    var exifStr = piexif.dump(exifObj);

    var reader = new FileReader();
    reader.onload = function(e) {
        var inserted = piexif.insert(exifStr, e.target.result);

        var image = new Image();
        image.src = inserted;
        image.width = 200;
        document.querySelector("body").appendChild(image);
        

    };
    reader.readAsDataURL(file);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);