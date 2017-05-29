﻿/// <reference types="mocha" />

import { expect, use } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
use(sinonChai);

import { World } from '../../world';
import { Game, GameScene, Rect } from '../../engine';
import { MockGame, stubDocument, stubImage } from '../../engine/test';
import { tiles } from '../tile-db';
import { DungeonScene } from '../../scenes/dungeon-scene';
import { Entity } from '../../entity';

describe('dbs/tiles', () => {
    stubDocument();
    stubImage();

    let game: Game;
    let scene: GameScene;
    let world: World;
    beforeEach(() => {
        game = <any>new MockGame();
        scene = new GameScene(game);
        game.changeScene(scene);
        world = new World();
        scene.addObject(world);
    });

    describe('water_left', () => {
        it('should invoke Entity.takeDamage with 1 damage when an entity ticks', () => {
            let ent = new Entity('name', { maxHealth: 10, x: 0, y: 0, collisionBounds: new Rect(0, 32, 0, 32) });
            scene.addObject(ent);
            sinon.spy(ent, 'takeDamage');
            sinon.stub(world, 'getTileAt').withArgs(0, 0).returns(tiles['water_left']);
            world.tick(.02);
            expect(ent.takeDamage).to.have.been.calledOnce.calledWith(1);
        });
    });

    describe('water_right', () => {
        it('should invoke Entity.takeDamage with 1 damage when an entity ticks', () => {
            let ent = new Entity('name', { maxHealth: 10, x: 0, y: 0, collisionBounds: new Rect(0, 32, 0, 32) });
            scene.addObject(ent);
            sinon.spy(ent, 'takeDamage');
            sinon.stub(world, 'getTileAt').withArgs(0, 0).returns(tiles['water_right']);
            world.tick(.02);
            expect(ent.takeDamage).to.have.been.calledOnce.calledWith(1);
        });
    });

    describe('lava_left', () => {
        it('should invoke Entity.takeDamage with 3 damage when an entity ticks', () => {
            let ent = new Entity('name', { maxHealth: 10, x: 0, y: 0, collisionBounds: new Rect(0, 32, 0, 32) });
            scene.addObject(ent);
            sinon.spy(ent, 'takeDamage');
            sinon.stub(world, 'getTileAt').withArgs(0, 0).returns(tiles['lava_left']);
            world.tick(.02);
            expect(ent.takeDamage).to.have.been.calledOnce.calledWith(3);
        });
    });

    describe('lava_right', () => {
        it('should invoke Entity.takeDamage with 3 damage when an entity ticks', () => {
            let ent = new Entity('name', { maxHealth: 10, x: 0, y: 0, collisionBounds: new Rect(0, 32, 0, 32) });
            scene.addObject(ent);
            sinon.spy(ent, 'takeDamage');
            sinon.stub(world, 'getTileAt').withArgs(0, 0).returns(tiles['lava_right']);
            world.tick(.02);
            expect(ent.takeDamage).to.have.been.calledOnce.calledWith(3);
        });
    });

    describe('teleporter', () => {
        it('should navigate to an DungeonScene when a player lands', () => {
            (<any>scene).dungeon = new DungeonScene();
            let ent = new Entity('Player', { maxHealth: 10, x: 0, y: 0, collisionBounds: new Rect(0, 32, 0, 32) });
            scene.addObject(ent);
            sinon.spy(game, 'changeScene');
            sinon.stub(world, 'getTileAt').withArgs(0, 0).returns(tiles['teleporter']);
            world.tick(.02);
            expect(game.changeScene).to.have.been.calledOnce.calledWith(sinon.match.instanceOf(DungeonScene));
        });
        it('should preserve the game time when it navigates to a DungeonScene', () => {
            let dung = (<any>scene).dungeon = new DungeonScene();
            let ent = new Entity('Player', { maxHealth: 10, x: 0, y: 0, collisionBounds: new Rect(0, 32, 0, 32) });
            scene.addObject(ent);
            sinon.spy(game, 'changeScene');
            sinon.stub(world, 'getTileAt').withArgs(0, 0).returns(tiles['teleporter']);
            world.gameTime = 2953;
            world.tick(.02);
            expect(dung.world.gameTime).to.be.closeTo(world.gameTime, .00001);
        });
    });

    describe('dungeonTeleporter', () => {
        it('should navigate to the previous scene when the player lands', () => {
            let dungScene = scene = new DungeonScene();
            game.changeScene(scene);
            scene.start();

            let player: any = {};
            let returnWorld: any = { gameTime: 0 };
            let returnScene: GameScene = <any>{
                findObject: name => (name == 'Player') ? player :
                                     (name == 'World') ? returnWorld :
                                                         {},
                currentHealth: 5,
                game: game
            };
            dungScene.enter(returnScene, 0, 0);

            let ent = <Entity>dungScene.findObject('Player');
            sinon.spy(game, 'changeScene');
            sinon.stub(dungScene.world, 'getTileAt').withArgs(0, 0).returns(tiles['dungeonTeleporter']);
            dungScene.world.tick(.02);
            expect(game.changeScene).to.have.been.calledOnce.calledWith(returnScene);
        });
        it('should preserve the game time when it navigates to the previous scene', () => {
            let dungScene = scene = new DungeonScene();
            game.changeScene(scene);
            scene.start();

            let player: any = {};
            let returnWorld: any = { gameTime: 0 };
            let returnScene: GameScene = <any>{
                findObject: name => (name == 'Player') ? player :
                                     (name == 'World') ? returnWorld :
                                                         {},
                currentHealth: 5,
                game: game,
                world: returnWorld
            };
            dungScene.enter(returnScene, 0, 0);

            let ent = <Entity>dungScene.findObject('Player');
            sinon.spy(game, 'changeScene');
            sinon.stub(dungScene.world, 'getTileAt').withArgs(0, 0).returns(tiles['dungeonTeleporter']);
            dungScene.world.gameTime = 28582.5;
            dungScene.world.tick(.02);
            expect((<any>returnScene).world.gameTime).to.be.closeTo(dungScene.world.gameTime, .00001);
        });
    });
});
