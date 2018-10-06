window.onload = function () {

    var myTouchStatus = false;
    var myFrequency = 0;
    var myGain = 0;

    var connectionKeys = [];

    // Initialize Firebase

    var config = {
        apiKey: "AIzaSyDRol3DvQ2343emS0aQ-iJGHsaGuCGbECc",
        authDomain: "noise-manipulator.firebaseapp.com",
        databaseURL: "https://noise-manipulator.firebaseio.com",
        projectId: "noise-manipulator",
        storageBucket: "noise-manipulator.appspot.com",
        messagingSenderId: "464135295056"
    };

    firebase.initializeApp(config);

    var database = firebase.database();

    var connectionLog = database.ref(`/connectedUsers`);

    var connectedRef = database.ref(".info/connected");

    var myConnectionKey = connectionLog.push().key;

    // var connectionKey;

    // When the client's connection state changes...

    // connectedRef.on("value", function (snapshot) {

    //     // If they are connected..
    //     if (snapshot.val()) {


    //         connectionKey = connectionLog.push().key;

    //         console.log(connectionLog);

    //         console.log(connectionKey);

    //         // var synthPad = new SynthPad();

    //         connection.onDisconnect().remove()

    //     }
    // });

    var createButtons = function () {

        connectionKeys.push(myConnectionKey);

        for (i = 0; i < 2; i++) {

            // **Define by indexing through Firebaxe
            var connectionKey = `test${i}`;

            connectionKeys.push(connectionKey);

            database.ref(`/connectedUsers/${connectionKeys[i]}/`).set({
                touchStatus: false,
                param1: "",
                param2: "",
            });

            database.ref(`/connectedUsers/${connectionKeys[i]}/`).onDisconnect().remove()

            //Add functions to remove the key from the connectionKeys array and the button from the button-box


            var button = $(`<a>`);
            button.attr(`class`, `btn-floating btn-large waves-effect waves-light red`)
                .attr(`id`, `play-${connectionKeys[i]}`)
                .attr(`value`, connectionKeys[i])
                .html(`
                <i class="material-icons">
                play_circle_outline</i>`);

            $(`#user-buttons`).append(button);

            $(`#play-${connectionKeys[i]}`).on(`click`, function () {

                
                // If myConnectionKey === $(this).attr(`value`)

                // **TrackPad Listener --> TrackPad input function to Firebase data
                // **Firebase Listener --> Firebase data for myConnectKey to PlaySound function.

                // Else
                // **Firebase Listener --> Firebase data for $(this).val() to PlaySound function.

                var connectionKey = $(this).attr(`value`);
                var touchStatus = false;

                
                // Break into TrackPad listener and Firebase Listener functions

                var SynthPad = (function () {
                    // ***GLOBAL
                    var myCanvas;
                    var frequencyLabel;
                    var volumeLabel;

                    var myAudioContext;
                    var oscillator;
                    var gainNode;

                    // Notes
                    var lowNote = 261.63; // C4
                    var highNote = 493.88; // B4

                    // Constructor
                    var SynthPad = function () {
                        myCanvas = document.getElementById('touchpad');
                        frequencyLabel = document.getElementById('frequency');
                        volumeLabel = document.getElementById('volume');

                        // Create an audio context.
                        window.AudioContext = window.AudioContext || window.webkitAudioContext;
                        myAudioContext = new window.AudioContext();

                        SynthPad.setupEventListeners();
                    };


                    // Event Listeners
                    SynthPad.setupEventListeners = function () {

                        // Disables scrolling on touch devices.
                        document.body.addEventListener('touchmove', function (event) {
                            event.preventDefault();
                        }, false);

                        myCanvas.addEventListener('mousedown', SynthPad.playSound);
                        myCanvas.addEventListener('touchstart', SynthPad.playSound);

                        myCanvas.addEventListener('mouseup', SynthPad.stopSound);
                        document.addEventListener('mouseleave', SynthPad.stopSound);
                        myCanvas.addEventListener('touchend', SynthPad.stopSound);
                    };




                    // Play a note.
                    SynthPad.playSound = function (event) {
                        oscillator = myAudioContext.createOscillator();
                        gainNode = myAudioContext.createGain();

                        oscillator.type = 'triangle';

                        gainNode.connect(myAudioContext.destination);
                        oscillator.connect(gainNode);

                        touchStatus = true;


                        SynthPad.updateFrequency(event);

                        oscillator.start(0);


                        myCanvas.addEventListener('mousemove', SynthPad.updateFrequency);
                        myCanvas.addEventListener('touchmove', SynthPad.updateFrequency);
                        myCanvas.addEventListener('touchend', SynthPad.stopSound);
                        myCanvas.addEventListener('mouseout', SynthPad.stopSound);
                    };


                    // Stop the audio.
                    SynthPad.stopSound = function (event) {

                        touchStatus = false;
                        
                        oscillator.stop(0);
                        SynthPad.updateFrequency();

                        myCanvas.removeEventListener('mousemove', SynthPad.updateFrequency);
                        myCanvas.removeEventListener('touchmove', SynthPad.updateFrequency);
                        myCanvas.removeEventListener('touchend', SynthPad.stopSound);
                        myCanvas.removeEventListener('mouseout', SynthPad.stopSound);
                    };


                    // Calculate the note frequency.
                    SynthPad.calculateNote = function (posX) {
                        var noteDifference = highNote - lowNote;
                        var noteOffset = (noteDifference / myCanvas.offsetWidth) * (posX - myCanvas.offsetLeft);
                        return lowNote + noteOffset;
                    };


                    // Calculate the volume.
                    SynthPad.calculateVolume = function (posY) {
                        var volumeLevel = 1 - (((100 / myCanvas.offsetHeight) * (posY - myCanvas.offsetTop)) / 100);
                        return volumeLevel;
                    };


                    // Fetch the new frequency and volume.
                    SynthPad.calculateFrequency = function (x, y) {
                        var noteValue = SynthPad.calculateNote(x);
                        var volumeValue = SynthPad.calculateVolume(y);

                        oscillator.frequency.value = noteValue;
                        gainNode.gain.value = volumeValue;

                        database.ref(`/connectedUsers/${connectionKey}`).set({
                            touchStatus: touchStatus,
                            param1: noteValue,
                            param2: volumeValue,
                        });

                        // console.log(connectionKey);

                        frequencyLabel.innerHTML = Math.floor(noteValue) + ' Hz';
                        volumeLabel.innerHTML = Math.floor(volumeValue * 100) + '%';
                    };


                    // Update the note frequency.
                    SynthPad.updateFrequency = function (event) {
                        if (event.type == 'mousedown' || event.type == 'mousemove') {
                            SynthPad.calculateFrequency(event.x, event.y);

                        } else if (event.type == 'touchstart' || event.type == 'touchmove') {
                            var touch = event.touches[0];
                            SynthPad.calculateFrequency(touch.pageX, touch.pageY);
                        }

                        else if (event.type == `touchend`  || event.type == 'mouseout') {
                            SynthPad.calculateFrequency();
                        }
                    };


                    // Export SynthPad.
                    return SynthPad;
                })();
                var synthPad = new SynthPad();
            });
        }
    }
    createButtons();

    var destroyButton = ""; //create to call on disconnect of user  

    // synthpad function

};

    // Initialize the page.
    // window.onload = function() {
    //   var synthPad = new SynthPad();
    // }
