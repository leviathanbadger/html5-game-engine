﻿import { GameObject, GameObjectOptions } from '../game-object';
import { GameScene } from '../game-scene';
import { AudioT } from '../utils/audio';
import merge = require('lodash.merge');

export interface AudioSourceObjectOptions extends GameObjectOptions {
    shouldLoop?: boolean,
    sceneIndependent?: boolean,
    beginPlay?: boolean,
    channel?: string
}

export class AudioSourceObject extends GameObject {
    constructor(name: string, private audio: AudioT, opts: AudioSourceObjectOptions = {}) {
        super(name, merge({
            shouldRender: false
        }, opts));

        if (typeof opts.shouldLoop !== 'undefined') this._shouldLoop = opts.shouldLoop;
        if (typeof opts.sceneIndependent !== 'undefined') this._sceneIndependent = opts.sceneIndependent;
        if (typeof opts.beginPlay !== 'undefined') this._beginPlay = opts.beginPlay;
        if (typeof opts.channel !== 'undefined') this._channel = opts.channel;
    }
    
    private _shouldLoop = false;
    get shouldLoop() {
        return this._shouldLoop;
    }
    
    private _sceneIndependent = false;
    get sceneIndependent() {
        return this._sceneIndependent;
    }
    
    private _channel: string = '';
    get channel() {
        return this._channel;
    }
    
    private volumeListener: (() => void) | null;
    
    private _beginPlay = true;
    
    onAddToScene() {
        super.onAddToScene();
        
        let theirAudio = this.resources.loadAudio(this.audio.src);
        this._myAudio = document.createElement('audio');
        this._myAudio.src = theirAudio.src;
        this._myAudio.onended = () => {
            if (this._shouldLoop) this._myAudio.play();
            else {
                if (this.scene) this.scene.removeObject(this);
                if (this.volumeListener) {
                    this.volumeListener();
                    this.volumeListener = null;
                }
            }
        };
        this.volumeListener = this.game.audioController.volumeChanged.addListener(this.onVolumeChanged.bind(this));
        if ((this.game.scene == this.scene || this.sceneIndependent) && this._beginPlay) this._myAudio.play();
        this.onVolumeChanged({channel: this.channel, volume: this.game.audioController.getVolume(this.channel)});
    }
    private onVolumeChanged({channel, volume}: {channel: string, volume: number}) {
        if (channel !== this._channel) return;
        if (!this._myAudio) return;
        let relativeVolume = (typeof this.audio.relativeVolume === 'undefined' ? 1 : this.audio.relativeVolume);
        this._myAudio.volume = volume * relativeVolume;
    }
    
    private _myAudio: HTMLAudioElement;
    get myAudio() {
        return this._myAudio;
    }
    
    onSceneEnter() {
        if (this.myAudio.paused) this._myAudio.play();
    }
    onSceneExit() {
        if (!this.myAudio.paused && !this.sceneIndependent) this._myAudio.pause();
    }
}
