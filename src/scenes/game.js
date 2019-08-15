import Phaser from 'phaser';
import { Scene } from 'phaser';
import io from 'socket.io-client';



// declaration des variables 
let cow
let bombs
let socket
let username
let cow2
let cow3
let dog
let donkey
let target
let sky
let score = 0
let scoreLabel
let capture =false



class GameScene extends Scene {
    constructor() {
      super('game');
    }
    
    create() {

                                                       //SOCKET 
        socket = io(`${location.hostname}:8085`);
        username = prompt('Pseudo');
        
      // emit d'un tableau input avec score et username
        socket.emit("input",{
          username:username,
          score:score,
        })
        
      // pop up de connexion/deconnexion
        let poppers = document.getElementById("popup");
        socket.on("new user",(username)=>{
            poppers.classList.add("popup");
            poppers.innerText = username+ " est"+" connecté";           
        })
        socket.on("user disconnect",(username) => {
            let connect = document.getElementById("popup");
            let child  = connect.children;
            for(let i = 0; i < child.length;i++) {
                if(child[i].innerText == username + " est connecté")
                    connect.removeChild(child[i]);
            }
           poppers.classList.add("popup");
            poppers.innerText = username + " est deconnecté"
        })
        poppers.addEventListener("animationend",(event) => {
         if(event.animationName == "out") {
               poppers.classList.remove("popup");
             }
         })
      
                                                  // JEU 


     /*création des caractéristiques des cibles*/
       let character=[{
        name:"cow",
        sound:this.sound.add('die',{volume: 0.9}),
        score:5,
      },{
        name:"cow2",
        sound:this.sound.add('cri',{volume: 0.9}),
        score:10,
      },{
        name:"cow3",
        sound:this.sound.add('cri2',{volume: 0.9}),
        score:15,
      },{
        name:"dog",
        sound:this.sound.add('chien',{volume: 0.9}),
        score:20,
      },{
        name:"donkey",
        sound:this.sound.add('special',{volume: 0.9}),
        score:25,
      },{
        name:"bomb",
        sound:this.sound.add('diable',{volume: 0.9}),
        score:-100,

      }]

      // ajout du background
     
      sky = this.add.image(512, 380, 'sky');

      
      /*gestion du son du laser*/
      this.laser=this.sound.add('laser',{volume: 0.7});
      this.input.mouse.capture = true;



    

      // variables
      let x = Phaser.Math.Between(0, 20)
      let y = Phaser.Math.Between(0, 20)
      scoreLabel = this.add.text(680, 710, 'score: 000', { fontSize: '32px', fill: '#000' });
      

     // fonction qui crée les groupes d'animaux et les anime pendant le jeu et à leur mort

      let targets = (name,isAnimated = true,repeat = 30) => {

        // on crée le groupe d'objects et l'injecte dans la variable "target"
          target = this.physics.add.group({
            key: name,
            repeat: repeat,
            setXY: { x: 12, y: 0, stepX: x, stepY: y }
          });
        // si il est animé (tout sauf la bombe)
          if(isAnimated){
            
            this.anims.create({
              key: 'die',
              frames: this.anims.generateFrameNumbers("cow", { start: 4, end: 5 }),
              frameRate: 10,
              repeat: -1
            });
        
            this.anims.create({
              key: 'move',
              frames: this.anims.generateFrameNumbers("cow", { start: 0, end: 4 }),
              frameRate: 10,
              repeat: -1
            });

            target.children.iterate(function (child) {
              child.on('pointerdown', function (pointer) {
                this.setFrame(5, true);
              })
            })
          } else {
           
            target.children.iterate(function (child) {
              console.log('ok')
              child.on('pointerdown', function (pointer) {
                this.setFrame(3, true);
              })
            })
          }

        // création de la physique de chaque membre du groupe + vitesse aléatoire pour chaque
        target.children.iterate(function (child) {
          child.setVelocityX(Phaser.Math.Between(0, 200), 20);
          child.setVelocityY(Phaser.Math.Between(-200, 200), 20);
          child.setBounce(1);
          child.setCollideWorldBounds(true);
          child.setInteractive();
          
        // création d'un évenement quand on clique sur les animaux 
          child.on('pointerdown', function (pointer) {

            setTimeout(()=> {
              this.disableBody(true, true)
            }, 100)

            /*Recupération son et score dans le tableau*/ 
            let find = character.find((value) => value.name == name)
            find.sound.play();
            score += find.score;
            scoreLabel.setText('Score: ' + score);
         
    if (score == 100) {
      alert('You won the game, congratulations!');
      location.reload();
    }

    else if (score < 0){
      alert('you are die !')
      location.reload();
    }     
           });
        });
        return target;
      }

      // appel de la fonction targets + on injecte le résultat dans une variable

      cow = targets("cow");

      setTimeout(()=> {
        dog = targets('dog')
      }, 1500 *10)

       setTimeout(()=> {
       cow2 =  targets("cow2")
      }, 3000 *10)

      setTimeout(()=> {
        donkey = targets("donkey")
      }, 4500 *10)

      setTimeout(()=> {
        cow3 = targets("cow3")
      }, 6000 *10)

      setInterval(() => {
        bombs = targets("bomb",false,2);
      },5000)

      /*Remplacement curseur par la mire*/ 
    //  this.input.setDefaultCursor('url(src/assets/Mire00.cur), pointer');
    }
     // End create

    update() {

 /*Gestion son laser*/
 if(this.input.activePointer.leftButtonDown() && !capture) {
  this.laser.play();
  capture = true;
  
  }
  if(this.input.activePointer.leftButtonReleased()) {
  capture = false;
  
  }


    let animalAnim = (target) => { 

        target.children.iterate(function (child) {
          child.anims.play('move', true);
        });
     
      }
    animalAnim(cow);
   
  }



} // END SCENE

export default GameScene


