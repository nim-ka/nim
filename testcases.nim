$time = { epoch() }

print() "Current server time: "
println() $time
println() ""

# Math operator testing
{
	print() "7 + 3 = "
	println() { 7 + 3 }

	print() "7 - 3 = "
	println() { 7 - 3 }

	print() "7 * 3 = "
	println() { 7 * 3 }

	print() "7 / 3 = "
	println() { 7 / 3 }

	print() "7 % 3 = "
	println() { 7 % 3 }

	print() "7 %/ 3 = "
	println() { 7 %/ 3 }
	println() ""
}

# Variable Testing
{
	$a = 3
	
	print() "$a = "
	println() $a

	print() "++$a = "
	println() { $a += 1 }

	print() "++$a = "
	println() { $a += 1 }

	print() "++$a = "
	println() { $a += 1 }

	print() "++$a = "
	println() { $a += 1 }

	print() "++$a = "
	println() { $a += 1 }

	print() "++$a = "
	println() { $a += 1 }

	print() "$a %/ 4 = "
	println() { $a %/ 4 }
	println() ""
}

# Numerical parser testing
{
	print() "110 = "
	println() 110
	
	print() "0b110 = "
	println() 0b110
	
	print() "0o110 = "
	println() 0o110
	
	print() "0x110 = "
	println() 0x110
	
	print() "110.347 = "
	println() 110.347
	
	print() "0x1A3F950CD + 0x129E3744 = "
	println() { 0x1A3F950CD + 0x129E3744 }
	println() ""
}

# Conditional testing
{
	$seconds = { $time %/ 1000 }
	$oddeven = { $seconds % 2 }
	
	print() "This second is "
	
	if $oddeven {
		print() "odd"
	} else {
		print() "even"
	}
	
	print() " ("
	print() $seconds
	println() ")."
	
	$lastdigit = { $seconds % 10 }
	
	if { $lastdigit == 7 } {
		println() "The last digit of this second IS EQUAL TO 7."
	} elseif { $lastdigit == 4 } {
		println() "The last digit of this second IS NOT EQUAL TO 7 and IS EQUAL TO 4."
	} else {
		println() "The last digit of this second IS NOT EQUAL TO 7 and IS NOT EQUAL TO 4."
	}
	
	if { $lastdigit > 8 } {
		println() "The last digit of this second IS GREATER THAN 8."
	} elseif { $lastdigit >= 8 } {
		println() "The last digit of this second IS NOT GREATER THAN 8 but IS GREATER THAN OR EQUAL TO 8."
	} elseif { $lastdigit <= 8 } {
		println() "The last digit of this second IS LESS THAN OR EQUAL TO 8."
	} else {
	    # ;)
	   	println() "The last digit of this second DOE̿S̈́ N̜̣̰̝͂ͥ̏̓̂O̦͖ͥͅT̜͈͐͆ E̡͎͍̝͚̻̙͉̩͇͂ͩ͛̅͑̎̚X̂̒̿̾͟͞҉̯̙̼̩͔̙̲̱̹̜͓̦̜ͅI̵̧̛̪̮͙̻̹̗ͤ̿͑̈̒ͫͫ͆ͬ̊ͮͧ̌ͪ͘͢S̴̡̜̼̠̗͚̱̝̬͚̣̗̺̯͉̝̠̓ͬ̒͟Ṯ̴̴̝̭̼̝͍͙̤͔̳̻̇̽͐"
	}
	
	println() ""
}

# Scope testing
{
	$var = 3
	print() "Outer scope: $var = "
	println() $var
	
	{
		$var = 1
		$var2 = 4
		print() "Inner scope: $var = "
		print() $var
		print() ", $var2 = "
		println() $var2
	}
	
	print() "Outer scope: $var = "
	print() $var
	print() ", $var2 = "
	println() $var2
	println() ""
}

# Function testing
{
	def "recursiveAdd" $a $b {
		if $b {
			recursiveAdd() { $a + 1 } { $b - 1 }
		} else {
			$a
		}
	}
	
	print() "3 + 4 = "
	println() { recursiveAdd() 3 4 }
}
