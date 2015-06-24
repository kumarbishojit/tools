<?php
session_start();

$chars = array("a","A","b","B","c","C","d","D","e","E","f","F","g","G","h","H","i","I","j","J",
               "k","K","L","m","M","n","N","o","p","P","q","Q","r","R","s","S","t","T",
               "u","U","v","V","w","W","x","X","y","Y","z","Z","2","3","4","5","6","7","8","9");

for ($i = 0, $length = 5; $i < $length; $i++){
	$textstr .= $chars[rand(0, count($chars) - 1)];
}

if (produceCaptchaImage($textstr) != IMAGE_ERROR_SUCCESS) {
    // output header
    header( "Content-Type: image/gif" );

    header("Expires: Mon, 21 Jul 2010 05:00:00 GMT");
    header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache" );

    // output error image
    @readfile('captcha/captcha_error.gif');
}
ob_end_flush();

function produceCaptchaImage($text) {
	$_SESSION['captcha'][$_GET['m']]=$text;
    // constant values
    $backgroundSizeX = 2000;
    $backgroundSizeY = 350;
    $sizeX = 100;
    $sizeY = 30;
    $fontFile = "captcha/verdana.ttf";
    $textLength = strlen($text);

    // generate random security values
    $backgroundOffsetX = rand(0, $backgroundSizeX - $sizeX - 1);
    $backgroundOffsetY = rand(0, $backgroundSizeY - $sizeY - 1);
    $angle = rand(-5, 5);
    $fontColorR = rand(0, 127);
    $fontColorG = rand(0, 127);
    $fontColorB = rand(0, 127);

    $fontSize = rand(14, 24);
    $textX = rand(0, (int)($sizeX - 0.9 * $textLength * $fontSize)); // these coefficients are empiric
    $textY = rand((int)(1.25 * $fontSize), (int)($sizeY - 0.2 * $fontSize)); // don't try to learn how they were taken out

    $gdInfoArray = gd_info();
    if (! $gdInfoArray['PNG Support'])
        return IMAGE_ERROR_GD_TYPE_NOT_SUPPORTED;

    // create image with background
    $src_im = imagecreatefrompng( "captcha/background.png");
    if (function_exists('imagecreatetruecolor')) {
        // this is more qualitative function, but it doesn't exist in old GD
        $dst_im = imagecreatetruecolor($sizeX, $sizeY);
        $resizeResult = imagecopyresampled($dst_im, $src_im, 0, 0, $backgroundOffsetX, $backgroundOffsetY, $sizeX, $sizeY, $sizeX, $sizeY);
    } else {
        // this is for old GD versions
        $dst_im = imagecreate( $sizeX, $sizeY );
        $resizeResult = imagecopyresized($dst_im, $src_im, 0, 0, $backgroundOffsetX, $backgroundOffsetY, $sizeX, $sizeY, $sizeX, $sizeY);
    }

    if (! $resizeResult)
        return IMAGE_ERROR_GD_RESIZE_ERROR;

    // write text on image
    if (! function_exists('imagettftext'))
        return IMAGE_ERROR_GD_TTF_NOT_SUPPORTED;
    $color = imagecolorallocate($dst_im, $fontColorR, $fontColorG, $fontColorB);
    imagettftext($dst_im, $fontSize, -$angle, $textX, $textY, $color, $fontFile, $text);

    // output header
    header("Content-Type: image/png");

    // output image
    imagepng($dst_im);

    // free memory
    imagedestroy($src_im);
    imagedestroy($dst_im);

    return IMAGE_ERROR_SUCCESS;
}

?>