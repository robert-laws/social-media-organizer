import React from 'react'

export default function PageHead({ kicker, title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        {kicker && <div className="page-kicker">{kicker}</div>}
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {children && <div className="flex wrap">{children}</div>}
    </div>
  )
}
