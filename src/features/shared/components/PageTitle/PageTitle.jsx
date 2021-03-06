import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Flash } from 'features/shared/components'
import { Link } from 'react-router'
import { humanize, capitalize } from 'utility/string'
import { AutoAffix } from 'react-overlays'
import makeRoutes from 'routes'
import actions from 'actions'
import styles from './PageTitle.scss'
import componentClassNames from 'utility/componentClassNames'

class PageTitle extends React.Component {
  constructor(props){
    super(props)
    this.state={component: null}
  }

  componentDidMount() {
    this.setState({component: ReactDOM.findDOMNode(this).parentNode})
  }
  render() {
    const chevron = require('images/chevron.png')

    return(
      <div className={componentClassNames(this)} >
        <div className={`${styles.main} navbar navbar-fixed-top`}>
          <div className={styles.navigation}>
            <ul className={styles.crumbs}>
              {this.props.breadcrumbs.map(crumb =>
                <li className={styles.crumb} key={crumb.name}>
                  {!crumb.last && <Link to={'/' + crumb.path}>
                    {capitalize(crumb.name)}
                    <img src={chevron} className={styles.chevron} />
                  </Link>}

                  {crumb.last && <span className={styles.title}>
                    {this.props.title || crumb.name}
                  </span>}
                </li>
              )}
            </ul>
          </div>

          {Array.isArray(this.props.actions) && <ul className={styles.actions}>
            {this.props.actions.map(item => <li key={item.key}>{item}</li>)}
          </ul>}
        </div>
        <AutoAffix viewportOffsetTop={60} container={this.state.component} affixClassName={styles.flash} >
          <div>
              <Flash
                messages={this.props.flashMessages}
                markFlashDisplayed={this.props.markFlashDisplayed}
                dismissFlash={this.props.dismissFlash}
              />
          </div>
        </AutoAffix>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const routes = makeRoutes()
  const pathname = state.routing.locationBeforeTransitions.pathname
  const breadcrumbs = []
  const lang = state.core.lang

  let currentRoutes = routes.childRoutes
  let currentPath = []
  pathname.split('/').forEach(component => {
    let match = currentRoutes.find(route => {
      return route.path == component || route.path.indexOf(':') >= 0
    })

    if (match) {
      currentRoutes = match.childRoutes || []
      currentPath.push(component)

      if (!match.skipBreadcrumb) {
        let crumbName =  match.name || humanize(component)
        if( lang === 'zh' &&  match.name_zh ){
          crumbName = match.name_zh
        }
        breadcrumbs.push({
          name: crumbName ,
          path: currentPath.join('/')
        })
      }
    }
  })

  breadcrumbs[breadcrumbs.length - 1].last = true

  return {
    breadcrumbs,
    flashMessages: state.app.flashMessages,
  }
}

export default connect(
  mapStateToProps,
  (dispatch) => ({
    markFlashDisplayed: (key) => dispatch(actions.app.displayedFlash(key)),
    dismissFlash: (key) => dispatch(actions.app.dismissFlash(key)),
  })
)(PageTitle)
