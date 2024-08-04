import React from 'react'
import css from './Spinner.module.css'

export default function Spinner() {
    return (
        <div className={css.loading}>
            <div className={css.load}></div>
        </div>
    )
}
