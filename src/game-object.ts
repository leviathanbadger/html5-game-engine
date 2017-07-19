﻿import { degToRad, radToDeg, fmod, pointDirection } from './utils/math';
import { Rect } from './utils/rect';
import { Game } from './game';
import { GameEvent } from './events/events';
import { SpriteT } from './utils/sprite';
import { measureSprite } from './utils/render';
import { GameScene } from './game-scene';
import { Camera } from './camera';
import { ResourceLoader } from './resource-loader';
import { EventQueue } from './events/event-queue';
import { CollisionMask } from './physics/collision-mask';
import { GraphicsAdapter } from './graphics/graphics-adapter';

export type RenderCameraT = 'default' | 'none' | Camera;

export interface GameObjectOptions {
    x?: number,
    y?: number,

    shouldTick?: boolean,
    direction?: number,
    speed?: number,
    hspeed?: number,
    vspeed?: number,

    shouldRender?: boolean,
    renderCamera?: RenderCameraT,
    sprite?: SpriteT,
    animationAge?: number,
    animationSpeed?: number,
    imageAngle?: number,
    
    mask?: CollisionMask,
};

export class GameObject {
    constructor(name: string, opts: GameObjectOptions = {}) {
        this._name = name;

        if (typeof opts.x != 'undefined') this.x = opts.x;
        if (typeof opts.y != 'undefined') this.y = opts.y;

        if (typeof opts.shouldTick != 'undefined') this.shouldTick = opts.shouldTick;
        if (typeof opts.direction != 'undefined') this.direction = opts.direction;
        if (typeof opts.speed != 'undefined') this.speed = opts.speed;
        if (typeof opts.hspeed != 'undefined') this.hspeed = opts.hspeed;
        if (typeof opts.vspeed != 'undefined') this.vspeed = opts.vspeed;

        if (typeof opts.shouldRender != 'undefined') this.shouldRender = opts.shouldRender;
        if (typeof opts.renderCamera != 'undefined') this.renderCamera = opts.renderCamera;
        if (typeof opts.sprite != 'undefined') this.sprite = opts.sprite;
        if (typeof opts.animationAge != 'undefined') this.animationAge = opts.animationAge;
        if (typeof opts.animationSpeed != 'undefined') this.animationSpeed = opts.animationSpeed;
        if (typeof opts.imageAngle != 'undefined') this.imageAngle = opts.imageAngle;
        
        if (typeof opts.mask != 'undefined') this.mask = opts.mask;
    }

    private DEBUG_MOVEMENT = false;

    private _name;
    get name(): string {
        return this._name;
    }

    set name(val: string) {
        this._name = val;
    }

    private _x = 0;
    get x() {
        return this._x;
    }
    set x(val) {
        this._x = val;
    }
    private _y = 0;
    get y() {
        return this._y;
    }
    set y(val) {
        this._y = val;
    }

    private _shouldTick = true;
    get shouldTick() {
        return this._shouldTick;
    }
    set shouldTick(val) {
        this._shouldTick = val;
    }

    private _dir = 0;
    private _speed = 0;
    private _hspeed = 0;
    private _vspeed = 0;

    get direction() {
        return this._dir;
    }
    set direction(val) {
        if (this.DEBUG_MOVEMENT) console.log(`setting direction: ${val}`);
        val = fmod(val, 360);
        if (this._dir == val) return;
        this._dir = val;
        this.updateHVSpeed();
    }
    get speed() {
        return this._speed;
    }
    set speed(val) {
        if (this.DEBUG_MOVEMENT) console.log(`setting speed: ${val}`);
        if (val < 0) throw new Error(`Invalid speed: ${val}. Must be >= 0`);
        if (this._speed == val) return;
        this._speed = val;
        this.updateHVSpeed();
    }

    get hspeed() {
        return this._hspeed;
    }
    set hspeed(val) {
        if (this.DEBUG_MOVEMENT) console.log(`setting hspeed: ${val}`);
        if (this._hspeed == val) return;
        this._hspeed = val;
        this.updateDirectionAndSpeed();
    }
    get vspeed() {
        return this._vspeed;
    }
    set vspeed(val) {
        if (this.DEBUG_MOVEMENT) console.log(`setting vspeed: ${val}`);
        if (this._vspeed == val) return;
        this._vspeed = val;
        this.updateDirectionAndSpeed();
    }

    private updateHVSpeed() {
        let radians = degToRad(this._dir);
        this._vspeed = -Math.sin(radians) * this._speed;
        this._hspeed = Math.cos(radians) * this._speed;
        if (this.DEBUG_MOVEMENT) console.log(`  hspeed: ${this._hspeed}; vspeed: ${this._vspeed}`);
    }
    private updateDirectionAndSpeed() {
        this._speed = Math.sqrt(this._hspeed * this._hspeed + this._vspeed * this._vspeed);
        if (this._speed == 0) return;
        this._dir = pointDirection(0, 0, this._hspeed, this._vspeed);
        if (this._dir < 0) this._dir += 360;
        if (this.DEBUG_MOVEMENT) console.log(`  speed: ${this._speed}; direction: ${this._dir}`);
    }
    
    private _mask: CollisionMask;
    get mask() {
        return this._mask;
    }
    set mask(val: CollisionMask) {
        if (val === this._mask) return;
        if (this._mask && this.scene) this.scene.removeCollider(this._mask);
        this._mask = val;
        if (this._mask && this.scene) this.scene.addCollider(this._mask);
    }

    private _shouldRender = true;
    get shouldRender() {
        return this._shouldRender;
    }
    set shouldRender(val) {
        this._shouldRender = val;
    }

    private _renderCamera: RenderCameraT = 'default';
    get renderCamera(): RenderCameraT {
        return this._renderCamera;
    }
    set renderCamera(val: RenderCameraT) {
        this._renderCamera = val;
    }

    private _sprite: SpriteT = null;
    get sprite() {
        return this._sprite;
    }
    set sprite(val) {
        this._sprite = val;
    }

    private _animationAge = 0;
    get animationAge() {
        return this._animationAge;
    }
    set animationAge(val) {
        this._animationAge = val;
    }
    private _animationSpeed = 1;
    get animationSpeed() {
        return this._animationSpeed;
    }
    set animationSpeed(val) {
        this._animationSpeed = val;
    }

    private _imageAngle = 0;
    get imageAngle() {
        return this._imageAngle;
    }
    set imageAngle(val) {
        this._imageAngle = val;
    }

    private _scene: GameScene;
    get scene(): GameScene {
        if (!this._scene) return null;
        return this._scene;
    }
    get game(): Game {
        if (!this.scene) return null;
        return this.scene.game;
    }
    get resources(): ResourceLoader {
        if (!this.game) return null;
        return this.game.resourceLoader;
    }
    get events(): EventQueue {
        if (!this.game) return null;
        return this.game.eventQueue;
    }
    addToScene(scene: GameScene) {
        if (this._scene) throw new Error('This game object is already added to a scene!');
        this._scene = scene;
        if (this.mask) this.scene.addCollider(this.mask);
    }
    removeFromScene() {
        if (this.mask) this.scene.removeCollider(this.mask);
        this._scene = null;
    }

    onSceneEnter() { }
    onSceneExit() { }

    handleEvent(evt: GameEvent): boolean | void {
    }

    tick(delta: number) {
        if (!this.shouldTick) return;

        this.x += this.hspeed * delta;
        this.y += this.vspeed * delta;
        this.animationAge += this.animationSpeed * delta;
    }
    fixedTick() { }
    
    render(adapter: GraphicsAdapter) {
        if (!this.shouldRender) return;
        adapter.renderTransformed(this.x, this.y, -degToRad(this.imageAngle), 1, 1, () => {
            this.renderImpl(adapter);
        });
    }
    protected renderImpl(adapter: GraphicsAdapter) {
        adapter.renderObject(this);
    }
    
    transformPixelCoordinates(x: number, y: number): [number, number];
    transformPixelCoordinates(coords: { x: number, y: number }): [number, number];
    transformPixelCoordinates(x: number | { x: number, y: number }, y?: number): [number, number] {
        if (typeof x === 'object') {
            y = x.y;
            x = x.x;
        }
        let camera = this.renderCamera;
        if (camera === 'default' || !camera) camera = this.scene.camera;
        if (camera === 'none' || !camera) return [x, y];
        else return camera.transformPixelCoordinates(x, y);
    }
}
