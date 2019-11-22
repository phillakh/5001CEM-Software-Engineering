document.getElementById("submit")addEventListener('click'),
    function validate(){
        if (document.getElementById('option1').checked){
            var x = document.getElementById('option1').value;
            document.getElementById("demo").innerHTML = x;
        }
        else if (document.getElementById('option2').checked){
            var x = document.getElementById('option2').value;
            document.getElementById("demo").innerHTML = x;
        }
        else if (document.getElementById('option3').checked){
            var x = document.getElementById('option3').value;
            document.getElementById("demo").innerHTML = x;
        }
    }