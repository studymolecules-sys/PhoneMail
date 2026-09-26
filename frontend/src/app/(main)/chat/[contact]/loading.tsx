import styles from './loading.module.css'

export default function ChatLoadingSkeleton() {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.header}>
        <div className={styles.backBtn} />
        <div className={styles.userInfo}>
          <div className={styles.nameLine} />
          <div className={styles.statusLine} />
        </div>
      </div>
      
      <div className={styles.chatArea}>
        <div className={`${styles.bubble} ${styles.received}`} />
        <div className={`${styles.bubble} ${styles.received} ${styles.short}`} />
        <div className={`${styles.bubble} ${styles.sent}`} />
        <div className={`${styles.bubble} ${styles.received}`} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputBox} />
      </div>
    </div>
  )
}
