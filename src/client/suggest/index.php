<?php


$subject = $_SERVER['REQUEST_URI'];
$instagramSuggestPattern = "/^\/suggest\/i\/([\w|\.]+)$/";
preg_match($instagramSuggestPattern, $subject , $matches);
if (count($matches) == 2) {
	header('Location: '. 'https://' . $_SERVER['HTTP_HOST']  . '/app/#/suggest/' . $matches[1]);
} else {
	//echo 'Yelnar will create error page here';
	header('Location: '. 'https://' . $_SERVER['HTTP_HOST']  . '/app/#/suggest/error');
}
// var_dump($matches);
