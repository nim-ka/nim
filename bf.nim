def "indexOf" $str $chr $startIndex {
	$cur = { $str @ $startIndex }
	
	if { $cur == $chr } {
		$startIndex
	} elseif $cur {
		indexOf() $str $chr { $startIndex + 1 }
	} else {
		0 - 1
	}
}

$asciiString = " 	\n
 !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"

def "getCodePoint" $chr {
	indexOf() $asciiString $chr 0
}

def "modifyStringIter" $str $index $char $nstr $i {
	if { $i == $index } {
		$nstr += $char
	} else {
		$nstr += { $str @ $i }
	}
	
	$i += 1
	
	if { $str @ $i } {
		modifyStringIter() $str $index $char $nstr $i
	} else {
		$nstr
	}
}

def "modifyString" $str $index $char {
	modifyStringIter() $str $index $char "" 0
}

def "createTape" $str $reps {
	if { $reps < 10 } {
		createTape() { $str += " " } { $reps + 1 }
	} else {
		$str
	}
}

$tape = { createTape() "" 0 }
$pointer = 0

$input = "Hello, world!"
$inputpointer = 0

def "findMatchingOpenBracket" $code $index $scopeDepth {
	if { { $code @ $index } == "[" } {
		$scopeDepth -= 1
	}
	
	if { { $code @ $index } == "]" } {
		$scopeDepth += 1
	}
	
	if $scopeDepth {
		findMatchingOpenBracket() $code { $index - 1 } $scopeDepth
	} else {
		$index
	}
}

def "findMatchingCloseBracket" $code $index $scopeDepth {
	if { { $code @ $index } == "[" } {
		$scopeDepth += 1
	}
	
	if { { $code @ $index } == "]" } {
		$scopeDepth -= 1
	}
	
	if $scopeDepth {
		findMatchingCloseBracket() $code { $index + 1 } $scopeDepth
	} else {
		$index
	}
}

def "interpretBF" $code $index $output {
	$chr = { $code @ $index }
	$cell = { $tape @ $pointer }
	$cellvalue = { getCodePoint() $cell }
	
	if { $chr == "+" } {
		$tape = { modifyString() $tape $pointer { $asciiString @ { { $cellvalue + 1 } % 256 } } }
	} elseif { $chr == "-" } {
		$tape = { modifyString() $tape $pointer { $asciiString @ { { $cellvalue + 255 } % 256 } } }
	} elseif { $chr == ">" } {
		$pointer += 1
	} elseif { $chr == "<" } {
		$pointer -= 1
	} elseif { $chr == "." } {
		$output += $cell
	} elseif { $chr == "," } {
		if { $input @ $inputpointer } {
			$tape = { modifyString() $tape $pointer { $input @ $inputpointer } }
			$inputpointer += 1
		} else {
			$tape = { modifyString() $tape $pointer " " }
		}
	} elseif { $chr == "[" } {
		if { $cellvalue == 0 } {
			$index = { findMatchingCloseBracket() $code $index 0 }
		}
	} elseif { $chr == "]" } {
		if $cellvalue {
			$index = { findMatchingOpenBracket() $code $index 0 }
		}
	}
	
	if $chr {
		interpretBF() $code { $index + 1 } $output
	} else {
		$output
	}
}

$code = "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++."

println() { interpretBF() $code 0 "" }
