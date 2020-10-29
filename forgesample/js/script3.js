$(document).ready(function () {
    document.getElementById("nova").addEventListener("click", dodajFunkcija);
});

/*Brojač - prebraja koliko je puta dodat novi element*/
var add = (function () {
    var brojač = 0;
    return function () { brojač += 1; return brojač; }
})();
/*funkcija za proveru*/
function proveraFunkcija(event, objProvera) {
    var tipka = event.which;
     if (tipka > 47 && tipka < 58) {
        document.getElementById("poruka").style.display = "none";
        dodajAktivno();
        
    }
    else if (tipka > 95 && tipka < 106){
        document.getElementById("poruka").style.display = "none";
        dodajAktivno();
        
    }
    else if (tipka == 46) {
        document.getElementById("poruka").style.display = "none";
        dodajAktivno();
       
    }
    else if (tipka == 8) {
        document.getElementById("poruka").style.display = "none";
        dodajAktivno();
        
    }
    else {
       document.getElementById("poruka").style.display = "block";
        dodajNeAktivno();
        proslediNeAktivno();
       /*console.log(objProvera.id);
       console.log(objProvera);*/
         
        /*briše staro polje _(celo) i dodaje novo polje*/ 
       var polje = document.getElementById(objProvera.id).parentNode;
        polje.innerHTML += document.getElementById(objProvera.id).innerHTML;
        /*ponovo izračunati procente*/
     /* NAĆI ZAŠTO NE RAČUNA OSTATAK SA SVIM POLJIMA*/
         
        var ar = ostatakIzračunavanje()[2];
         var dar = ar.length;
        ispravljeniOstatak();
         /*console.log(dar);*/
         var količnik = ispravljeniOstatak()[0];
        
             console.log(količnik);
             for (let ind = 0; ind < dar; ind++) {
                 document.getElementsByClassName("percentum")[ind].setAttribute("placeholder", "Prostalo je " + količnik.toPrecision(4) + "%");
             }

             var suma = ostatakIzračunavanje()[1];
             console.log(suma);
             if (suma == 100 || suma < 100) {
                 document.getElementById("poruka2").style.display = "none";
             }
             else if (suma > 100) {
                 document.getElementById("poruka2").style.display = "block";
             }
        /*console.log(polje);*/
       console.log(polje.innerHTML);
    }
}  
/*promena aktivnosti dugmića prosledi i dodaj*/
function dodajAktivno() {
    var nov = document.getElementById("nova");
    nov.disabled = false;
    nov.className = "aktivna"
}
function dodajNeAktivno() {
    var nov = document.getElementById("nova");
    nov.disabled = true;
    nov.className = "neaktivna"
}
function proslediAktivno() {
    var pros = document.getElementById("prosledi");
    pros.disabled = false;
    pros.className = "aktivna";
}
function proslediNeAktivno() {
    var pros = document.getElementById("prosledi");
    pros.disabled = true;
    pros.className = "neaktivna";
}
/*funkcija za filtriranje niza UF BREEE!*/
function filterNiza(value) {
    var skraćeniNiz = value != 0;
    return skraćeniNiz;
}
/*funkcija za izračunavanje ispravljenog ostatka kad se obrišu uneti procenti
a ne dodaje se novo polje*/
function ispravljeniOstatak(){
    /*suma skraćenog niza*/
    var ar = ostatakIzračunavanje()[2];
    var nizSkraćen = ar.filter(filterNiza);
    var dar = ar.length;
    var dniz = nizSkraćen.length;
    var kratkaSuma = 0;
    for (let ind = 0; ind < dniz; ind++) {
        kratkaSuma += parseInt(nizSkraćen[ind]);
    }
    var dniz= nizSkraćen.length;
    var razlika = 100 - parseInt(kratkaSuma);
    var n = dar - dniz;
    var količnik = razlika / n;
    return zaKoličnik = [količnik, dar, dniz, razlika];
}
/*funkcija za računanje ostatka*/
function ostatakIzračunavanje() {
    var x = document.getElementsByClassName("percentum");
    var d = x.length;
    var suma = 0;
    var a;
    for (var ind = 0, ar = []; ind < d; ind++) {
        a = parseInt(x[ind].value);
        if (x[ind].value.trim() == "") {
            a = 0;
        }
        ar.push(a);
        suma += a;
        ostatak = 100 - suma;
    }
    console.log(a);
    console.log(d);
    console.log(suma);
    console.log(ar);
    return izlaz = [ostatak, suma, ar];
}
function naUnos(objUnos) {
    /*c je trenutna uneta vrednost u polje text area*/
    var c = objUnos.value.trim();
    if (c === "") {
        c = 0;
    }
    var ostatak = ostatakIzračunavanje()[0];
    var cBroj = parseInt(c);
    var ostatakBroj = parseInt(ostatak);
    var suma = ostatakIzračunavanje()[1];
   /*dužine oba niza: celog i skraćenog - kad se obrišu nule*/
    var dar = ispravljeniOstatak()[1];
    var dniz = ispravljeniOstatak()[2];
    /*pošto se ostatak izračunava nakon unete vrednosti u naredno polje
       potrebna je promenljiva koja će računati ostatak bez te unete vrednosti (c)*/
    var ost = cBroj + ostatakBroj;
    /*ako su dobro unete sve vrednosti ostatak je nula
    menja se aktivno/neaktivno dugme Add new i Submit*/
    
    if (ostatak === 0) {
        dodajNeAktivno();
        proslediAktivno();
        document.getElementById("poruka2").style.display = "none";
        if (suma == 100) {

            for (let ind = 0; ind < dar; ind++) {
                document.getElementsByClassName("percentum")[ind].setAttribute("placeholder", "Obrišite polje");
            }
        }
    }
    else if (dniz < dar || cBroj == 0) {
        var količnik = ispravljeniOstatak()[0];
        console.log(količnik);
        console.log(suma);
        
        
        for (let ind = 0; ind < dar; ind++) {
            document.getElementsByClassName("percentum")[ind].setAttribute("placeholder", "Left " + količnik.toPrecision(4) + "%");
        }
    
        dodajNeAktivno();
    }
    else if (ostatak > 0) {
        dodajAktivno();
        proslediNeAktivno();
        document.getElementById("poruka2").style.display = "none";
    }
    /*ako se unese više od 100%*/
    else if (suma > 100) {
        console.log(suma);
        document.getElementById("poruka2").style.display = "block";
        proslediNeAktivno();
        dodajNeAktivno();
    }
    /*kad se prethodni netačan unos ispravi*/
    else if (suma < 100 || suma === ostatak) {
        document.getElementById("poruka2").style.display = "none";
        /*upisuje ostatak u polje nakon prepravke, kad se prekoračilo 100%*/
        objUnos.setAttribute("placeholder", "Left " + ost + "%");
    }
    
}
/*funkcija za dodavanje HTML*/
function dodajFunkcija() {
    dodajNeAktivno();
    var i = add();
    var j = 1 + i;
    var ostatak = ostatakIzračunavanje()[0];
    document.getElementById("dodatak" + i).innerHTML += '<span>' +
        '<div id="podela' + i + '" class="razdela">' +
        '<select name="elementi" id="elementi' + i + '" class="odabir">' +
        '<option value="closed">Closed</option>' +
        '<option value="open">Open</option>' +
        '<option value="drawer">Drawer</option>' +
        '<option value="doublDoor">Double door</option>' +
        '<option value="leftDoor">Left door</option>' +
        '<option value="rightdoor">Right door</option>' +
        '<option value="cassette">Cassette</option>' +
        '</select>' +
        '<div class="teksterija">' +
        '<textarea class="percentum"' + 'id="procenti' + i + '" name="unos' + i + 
        '" placeholder = " Left ' + ostatak + '%" ' + 
        'onkeydown="proveraFunkcija(event, this)" oninput="naUnos(this)"></textarea>' +
        '<div class="brisanje">' +
        '<button type="button" class = "zaBrisanje" id="brisanje' + i + '" onclick="obrisatiFunkcija(this)">&#9587</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</span>' +
        '<div id="dodatak' + j + '"></div>'
}
/*funkcija za brisanje nepotrebnog polja
vraća i potrebno za menjanje id-eva*/
function obrisatiFunkcija(objBrisanje) {
    /*dobija se vrednost id dugmeta koje je pritisnuto*/
    var indeks = objBrisanje.id;
    /*briše se početak id da bi se dobio samo broj koji je isti 
    sa brojem u id elementa koji se briše*/
    var i = indeks.replace("brisanje", "");
    /*pozivanje i brisanje traženog elementa*/
    document.getElementById("podela" + i).remove();
    var ostatak = ostatakIzračunavanje()[0];
    var suma = ostatakIzračunavanje()[1];
    var dar = ispravljeniOstatak()[1];
    var dniz = ispravljeniOstatak()[2];
    if (dniz == 0) {
        proslediNeAktivno();
    }
    else if (dniz < dar) {
        var količnik = ispravljeniOstatak()[0];
        console.log(količnik);
        for (let ind = 0; ind < dar; ind++) {
            document.getElementsByClassName("percentum")[ind].setAttribute("placeholder", "Prostalo je " + količnik.toPrecision(4) + "%");
        }
        dodajNeAktivno();
    }
    else if (ostatak > 0) {
        proslediNeAktivno();
        dodajAktivno();
        document.getElementById("poruka2").style.display = "none";
    }
      else if (ostatak === 0) {
        proslediAktivno();
        dodajNeAktivno();
        document.getElementById("poruka2").style.display = "none";
    }
    else if (suma > 100) {
        console.log(suma);
        document.getElementById("poruka2").style.display = "block";
        proslediNeAktivno();
        dodajNeAktivno();
    }
}
/*dodaj eventListener na dugme za unos i prosleđivanje*/


/*document.getElementById("prosledi").addEventListener("click", neninaFunkcija);*/

