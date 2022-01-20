const $messageform = document.querySelector('#message-form');
const $messagefield = document.querySelector('#message-field');
const $locationbutton = document.querySelector('#location');
const $messagesendbutton = document.querySelector('button');
const socket = io();
const messagetemplate = document.querySelector('#message-template').innerHTML;
const locationtemplate = document.querySelector('#location-message-template').innerHTML;
const messagebox = document.querySelector('#message-box');
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML;



//using querry string library to get username and room name
const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix:true});


socket.on('printmessage' , (messagedata)=>{
    console.log(messagedata);
    const html = Mustache.render(messagetemplate , {username : messagedata.username , message : messagedata.message , createdat : moment(messagedata.createdtime).format('h:mm a')});
    messagebox.insertAdjacentHTML('beforeend' , html);
    // window.scrollTo(0,document.body.scrollHeight);   

});

socket.on('printlocation' , (url)=>{
    console.log(url);
    const html = Mustache.render(locationtemplate ,{username : url.username , url : url.url , createdat : moment(url.createdtime).format('h:mm a')});
    messagebox.insertAdjacentHTML('beforeend' , html);

});

socket.on('roomdata' , ({room , users})=>{
    const html = Mustache.render(sidebartemplate , {room , users});
    document.querySelector('#sidebar').innerHTML = html;
});

$messageform.addEventListener('submit' , (e)=>{
    e.preventDefault();

 const messagedata = $messagefield.value;
 socket.emit('newmessage' , messagedata , (status)=>{
     console.log('message status :' , status);
 });
 $messagefield.value = "";
 $messagefield.focus();
});

$locationbutton.addEventListener('click' , ()=>{
    if(!navigator.geolocation){
        alert('your browser dont support geolocation');
    }
    $locationbutton.setAttribute('disabled' , 'disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendlocation' , {latitude : position.coords.latitude , longitude : position.coords.longitude} , ()=>{
            console.log('location shared');
            $locationbutton.removeAttribute('disabled');
        });
    });  
});
//first of all in this page this even will get emitted and server will listen to this for particular connection
socket.emit('join' , {username , room} , (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});