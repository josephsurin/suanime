import React, { Component } from 'react'
import { connect } from 'react-redux'
import { convertMS, genFilename } from '../../util/util.js'
import { queueDL, playAnime, launchInfo } from '../../actions/actions.js'
import { loadMAImage } from '../../util/maImageLoader'

class AnimeCard extends Component {
	constructor(props) {
		super(props)
		let { title, slug, poster } = this.props.animeDataRecent.anime
		let { episode, created_at } = this.props.animeDataRecent
		this.title = title
		this.link = `https://www.masterani.me/anime/info/${slug}`
		this.poster = `https://cdn.masterani.me/poster/${poster}`
		this.epLink = `https://www.masterani.me/anime/watch/${slug}/${episode}`
		this.lastEp = episode
		var tzOffset = Math.abs(new Date().getTimezoneOffset())*60*1000
		this.timeago = convertMS(Date.now()-Date.parse(created_at)-tzOffset)
		this.animeFilename = genFilename(title, episode)    
		this.epTitle = 'Episode '+episode
		this.state = { cposter: '' }
	}

	componentWillMount() {
		loadMAImage(this.poster).then(imgData => {
			this.setState({ cposter: imgData })
		}).catch(console.log)
	}

	render() {
		let { title, lastEp, timeago } = this
		var downloadClass = 'dp-btn'
		var playClass = 'none'
		var fn = genFilename(title, lastEp)
		if(this.props.downloading.includes(fn)) {
			downloadClass = 'none'
			playClass = 'dp-btn disabled'
		} else if(this.props.completed.includes(fn)) {
			downloadClass = 'none'
			playClass = 'dp-btn'
		} else {
			downloadClass = 'dp-btn'
			playClass = 'none'
		}
		this.content = 
			<div className="card-container" onClick={this.launchInfoPage.bind(this)}>
				<div className="card-bg" style={{ backgroundImage: `url('data:image/jpeg;base64,${this.state.cposter}')`}}></div>
				<div className={downloadClass} onClick={this.queueDLComp.bind(this)}><i className="material-icons">file_download</i></div>
				<div className={playClass} onClick={this.playEpComp.bind(this)}><i className="material-icons">play_arrow</i></div>
				<div className="card-header">
					<div className="card-date">{timeago}</div>
					<div className="card-episode">EP. {lastEp}</div>
				</div>
				<div className="spacer-vertical"/>
				<div className="card-title">{title}</div>
			</div>
		return this.content
	}

	queueDLComp(e) {
		e.stopPropagation()
		let { title, epLink, poster, animeFilename, epTitle } = this
		this.props.queueDL(epLink, animeFilename, poster, title, epTitle)
	}

	playEpComp(e) {
		e.stopPropagation()
		let { slug, title, poster } = this.props.animeDataRecent.anime
		let { epTitle } = this
		playAnime(title, epTitle, poster, slug)
	}

	launchInfoPage() {
		let { title, slug, id } = this.props.animeDataRecent.anime
		launchInfo(title, slug, id, null)
	}
}

const mapStateToProps = state => {
	var { downloading, completed } = state.downloadsReducer
	return {
		downloading,
		completed
	}
}

const mapDispatchToProps = dispatch => {
	return {
		queueDL: (epLink, animeFilename, posterImg, animeName, epTitle) => dispatch(
			queueDL(epLink, animeFilename, posterImg, animeName, epTitle)
		)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AnimeCard)