<?php
/**
 * Created by PhpStorm.
 * User: m.hejazi
 * Date: 3/31/19
 * Time: 4:49 PM
 * "Pdm718x716P3YLsLhX8P"
 * 91003664
 *
 *
 */


// enable extension=php_mcrypt.dll AND extension=php_soap.dll on php.ini
date_default_timezone_set('Asia/Tehran');
$KEY = "Your KEY";
$IV = "Your IV";
$username = "user";
$password = "pass";
function addpadding($string, $blocksize = 32)
{
    $len = strlen($string);
    $pad = $blocksize - ($len % $blocksize);
    $string .= str_repeat(chr($pad), $pad);
    return $string;
}

function strippadding($string)
{
    $slast = ord(substr($string, -1));
    $slastc = chr($slast);
    $pcheck = substr($string, -$slast);
    if (preg_match("/$slastc{" . $slast . "}/", $string)) {
        $string = substr($string, 0, strlen($string) - $slast);
        return $string;
    } else {
        return false;
    }
}

function encrypt($string = "")
{
    global $KEY, $IV;
    $key = base64_decode($KEY);
    $iv = base64_decode($IV);
    return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key, addpadding($string),
        MCRYPT_MODE_CBC, $iv));
}

function decrypt($string = "")
{
    global $KEY, $IV;
    $key = base64_decode($KEY);
    $iv = base64_decode($IV);
    $string = base64_decode($string);
    return strippadding(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $key, $string, MCRYPT_MODE_CBC,
        $iv));
}

?>
