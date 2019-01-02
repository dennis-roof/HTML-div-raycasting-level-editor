function $(id)
{
    return document.getElementById(id);
}

function myLog(text)
{
    $('debug').innerHTML = text + "\n" + $('debug').innerHTML;
}

function myLogArray(textArray)
{
    var text = "";
    for (var index in textArray) {
        text += textArray[index] + ':';
    }
    myLog(text);
}

function createImageCanvas(idName, blockSize, image)
{
    document.write(document.body.innerHTML + "\n" + '<canvas id="'+idName+'" width="'+blockSize+'" height="'+blockSize+'"></canvas>');
    var newCanvas = $(idName);
    var context = newCanvas.getContext('2d');
    context.drawImage(image, 0, 0, blockSize, blockSize);

    return context;
}
