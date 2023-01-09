<!DOCTYPE html>
<html>
	<head>
		<title>
			DOM Button Object
		</title>
		
		<!-- script to create new button -->
		<script>
			function Button() {
				var myDiv = document.getElementById("GFG");
				
				// creating button element
				var button = document.createElement('BUTTON');
				
				// creating text to be
				//displayed on button
				var text = document.createTextNode("Button");
				
				// appending text to button
				button.appendChild(text);
				
				// appending button to div
				myDiv.appendChild(button); ;
			}
		</script>
	</head>
	
	<body style = "text-align: center;">
	
		<h1 style = "color:green;">
		   JavaScript
		</h1>
		
		<h2>
			DOM Button Property
		</h2>
		
		


<p>Click the button to create a button.</p>



		
		<button onclick = "Button()">
			Press me!
		</button>
		
		<br><br>
		
		<div id = "GFG"></div>
	</body>
</html>				
