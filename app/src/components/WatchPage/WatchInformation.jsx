import React, { Component } from 'react';
const rp = require('request-promise')
import screenfull from 'screenfull'

export default class WatchInformation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            reqWidth: '100%',
            MALlink: null,
            animeInfo: ''
        }
    }

    componentDidMount() {
        var jikanBase = 'http://api.jikan.me'
        rp(`${jikanBase}/search/anime/`+this.props.animeName.replace(/\s+/g, "_")).then(data => {
            var first = JSON.parse(data).result[0]
            this.setState({
                MALlink: first.url
            })
            const malid = first.id
            rp(`${jikanBase}/anime/${malid}`).then(data => {
                this.setState({
                    animeInfo: data
                })
            })
        })
        this.fixWidths()
        window.addEventListener('resize', () => {
            this.fixWidths()
        })

        screenfull.on('change', () => {
            this.fixWidths()
        })
    }

    fixWidths() {
        var playerWrapper = document.getElementsByClassName('anime-player')[0]
        this.setState({
            reqWidth: playerWrapper.clientHeight*1.78 >= playerWrapper.clientWidth ? '100%' : (playerWrapper.clientHeight*1.78)+'px'
        })
    }

    render() {
        var malstyle = this.state.MALlink ? "anime-out-link mal-circle" : "anime-out-link mal-circle disabled"
        return (
            <div className="watch-information" style={{width: this.state.reqWidth}}>
                <div className="watch-image" style={{backgroundImage: `url('${this.props.posterImg}')`}}/>
                <div className="watch-title">{this.props.animeName} 
                    <br></br> 
                    <div className="watch-episode">{this.props.epNumber}</div>
                </div>
                <div className="spacer-horizontal"/>
                <div className="anime-out-link masterani-circle" onClick={this.openMasterani.bind(this)}></div>
                <div className={malstyle} onClick={this.openMAL.bind(this)}></div>
                <div className="anime-information">{this.state.animeInfo}</div>
            </div>
        )
    }
    openMasterani() {
        require('electron').shell.openExternal(`https://www.masterani.me/anime/info/${this.props.slug}`)
    }

    openMAL() {
        require('electron').shell.openExternal(this.state.MALlink)
    }
}
