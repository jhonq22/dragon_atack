
var dragon;
var derecha;
var izquierda;
var arriba;
var abajo;

var asteroides;
var texto;
var spacebar;
var sonidoDisparo;
var damage;
var recarga_energia;
var iniciar;

const vidadragon = 5;
const municionInicial = 10;
const velocidaddragon = 800;
const minAsteroides = 2;
const maxAsteroides = 3;
const velocidadCaida = 20;
const tiempoAparicion = 600;
const probabilidadEnergia = 20;
const municionPorEnergia = 6;

var tiempo = {
    minutos: '00',
    segundos: '00'
}

var tiempoUltimaPartida = tiempo;
var tiempoMejorPartida = tiempo;

var Inicio = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function Inicio() {
            Phaser.Scene.call(this, { key: 'Inicio' });
        },

    create() {
        tiempo = {
            minutos: '00',
            segundos: '00'
        }

        this.add.text(10, 10, 'Ultima Partida: ' + tiempoUltimaPartida.minutos + ':' + tiempoUltimaPartida.segundos +
            '\nMejor tiempo: ' + tiempoMejorPartida.minutos + ':' + tiempoMejorPartida.segundos, {
                fontSize: '20px',
                fill: '#ffffff'
            });



        var texto = this.add.text(game.config.width / 2, game.config.height / 2, 'Iniciar', 
        {

            fontSize: '40px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        texto.on('pointerdown', () => {
            this.scene.start('Principal');
        });

        iniciar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        iniciar.reset();
    },

    update() {
        if (iniciar.isDown) {
            this.scene.start('Principal');
        }
    }
});

var Principal = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function Principal() {
            Phaser.Scene.call(this, { key: 'Principal' });
        },

    preload() {
        this.load.image('sky', 'assets/sprites/ciudad_fuego.jpg');
        this.load.image('dragon', 'assets/sprites/dragon.png');
        this.load.spritesheet('asteroides', 'assets/sprites/eagle.png', { frameWidth: 180, frameHeight: 180 });
        this.load.image('bala', 'assets/sprites/bala_fire.png');
        this.load.image('energia', 'assets/sprites/energia3.png');

        this.load.audio('sonidoDisparo', 'assets/sonidos/disparo.wav');
        this.load.audio('damage', 'assets/sonidos/damages.mp3');
        this.load.audio('recarga_energia', 'assets/sonidos/recarga_energia.wav');
    },
    create() {


        this.add.image(700,  200, 'sky');
       

        dragon = this.physics.add.sprite(game.config.width / 2, game.config.height - 100, 'dragon');
        

        dragon.vida = vidadragon;
        dragon.municion = municionInicial;
        dragon.setCollideWorldBounds(true);

        sonidoDisparo = this.sound.add('sonidoDisparo');
        damage = this.sound.add('damage');
        recarga_energia = this.sound.add('recarga_energia');

        texto = this.add.text(10, 10, '', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setDepth(0.1);
        this.actualizarTexto();

        asteroides = this.physics.add.group({
            defaultKey: 'asteroides',
            frame: 0,
            maxSize: 120
        });

        balas = this.physics.add.group({
            classType: bala,
            maxSize: 10,
            runChildUpdate: true
        });

        bolasEnergia = this.physics.add.group({
            defaultKey: 'energia',
            maxSize: 20
        });

        this.time.addEvent({
            delay: tiempoAparicion,
            loop: true,
            callback: () => {
                this.generarAsteroides()
            }
        });

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.actualizarContador();
            }
        });

        this.physics.add.overlap(dragon, asteroides, this.colisiondragonAsteroide, null, this);
        this.physics.add.overlap(balas, asteroides, this.colisionBalaAsteroide, null, this);
        this.physics.add.overlap(dragon, bolasEnergia, this.colisiondragonEnergia, null, this);

        derecha = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        izquierda = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        arriba = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        abajo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        derecha.reset();
        izquierda.reset();

    },
    update() {
        Phaser.Actions.IncY(asteroides.getChildren(), velocidadCaida);
        asteroides.children.iterate(function (asteroide) {
            if (asteroide.y > 600) {
                asteroides.killAndHide(asteroide);
            }
        });

        Phaser.Actions.IncY(bolasEnergia.getChildren(), velocidadCaida);
        bolasEnergia.children.iterate(function (energia) {
            if (energia.y > 600) {
                bolasEnergia.killAndHide(energia);
            }
        });

        dragon.body.setVelocityX(0);
        if (izquierda.isDown)
        {
            dragon.body.setVelocityX(-velocidaddragon);
        }
        else if (derecha.isDown) 
        {
            dragon.body.setVelocityX(velocidaddragon);
        }


       /*  else if (arriba.isDown) 
        {
            dragon.body.setVelocityY(-velocidaddragon);
        }

         else if (abajo.isDown) 
        {
            dragon.body.setVelocityY(velocidaddragon);
        }
 */




        if (Phaser.Input.Keyboard.JustDown(spacebar) && dragon.municion > 0) {
            var bala = balas.get();

            if (bala) 
            {
                sonidoDisparo.play();
                bala.setRotation(30); // rotar  hacia abaj
                bala.fire(dragon.x, dragon.y);
                dragon.municion--;
                this.actualizarTexto();
            }
        }
    },
    generarAsteroides() {
        var numeroAsteroides = Phaser.Math.Between(minAsteroides, maxAsteroides);

        for (let i = 0; i < numeroAsteroides; i++) {
            var asteroide = asteroides.get();

            if (asteroide) 
            {
                asteroide.setScale(2); // para aumentar el tamaño
                asteroide.setActive(true).setVisible(true);
                asteroide.setFrame(Phaser.Math.Between(0, 1));
                asteroide.y = -100;
                asteroide.x = Phaser.Math.Between(0, game.config.width);
                this.physics.add.overlap(asteroide, asteroides, (asteroideEnColicion) => {
                    asteroideEnColicion.x = Phaser.Math.Between(0, game.config.width);
                });
            }
        }

        var numeroProbabilidad = Phaser.Math.Between(1, 100);

        if (numeroProbabilidad <= probabilidadEnergia) {
            var energia = bolasEnergia.get();

            if (energia) {
                energia.setActive(true).setVisible(true);
                energia.y = -100;
                energia.x = Phaser.Math.Between(0, game.config.width);
                this.physics.add.overlap(energia, asteroides, (energiaEnColicion) => {
                    energiaEnColicion.x = Phaser.Math.Between(0, game.config.width);
                });
            }
        }
    },
    colisiondragonAsteroide(dragon, asteroide) {
        if (asteroide.active) {
            asteroides.killAndHide(asteroide);
            asteroide.setActive(false);
            asteroide.setVisible(false);
            damage.play();
            if (dragon.vida > 0) {
                dragon.vida--;
                if (dragon.vida <= 0) {
                    this.finPartida();
                }
            }
            this.actualizarTexto();
        }
    },
    colisionBalaAsteroide(bala, asteroide) {
        if (bala.active && asteroide.active) {
            balas.killAndHide(bala);
            bala.setActive(false);
            bala.setVisible(false);
            asteroides.killAndHide(asteroide);
            asteroide.setActive(false);
            asteroide.setVisible(false);
        }
    },
    colisiondragonEnergia(dragon, energia) {
        if (energia.active) {
            bolasEnergia.killAndHide(energia);
            energia.setActive(false);
            energia.setVisible(false);
            recarga_energia.play();
            dragon.municion += municionPorEnergia;
            this.actualizarTexto();
        }
    },
    actualizarTexto() {

        texto.setText('Vidas: ' + dragon.vida + '\nBola Fuego: ' + dragon.municion +
            '\nTiempo: ' + tiempo.minutos + ':' + tiempo.segundos);
    },
    actualizarContador() {
        tiempo.segundos++;
        tiempo.segundos = (tiempo.segundos >= 10) ? tiempo.segundos : '0' + tiempo.segundos;
        if (tiempo.segundos >= 60) {
            tiempo.segundos = '00';
            tiempo.minutos++;
            tiempo.minutos = (tiempo.minutos >= 10) ? tiempo.minutos : '0' + tiempo.minutos;
        }
        this.actualizarTexto();
    },
    finPartida() {
        this.add.text(game.config.width / 2, game.config.height / 2, 'Fin de la partida.', {
            fontSize: '50px',
            fill: 'red'
        }).setOrigin(0.5);
        tiempoUltimaPartida = tiempo;
        var nuevoTiempo = parseInt(tiempo.minutos+tiempo.segundos);
        var mejorTiempo = parseInt(tiempoMejorPartida.minutos + tiempoMejorPartida.segundos);
        if(nuevoTiempo > mejorTiempo){
            tiempoMejorPartida = tiempo;
        }
        this.scene.pause();
        setTimeout(() => {
            this.scene.stop();
            this.scene.start('Inicio');
        }, 2000)
    }

});

var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    
    parent: 'Juego_dragon',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [Inicio, Principal]
};

var game = new Phaser.Game(config);