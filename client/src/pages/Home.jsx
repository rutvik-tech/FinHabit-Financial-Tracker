import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="home-page">

      <Navbar />

      {/* HERO SECTION */}

      <section className="hero-section">

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-dot"></span>
            SMARTER MONEY. BETTER HABITS.
          </div>

          <h1>
            Build Habits.
            <br />
            <span>Grow Your Wealth.</span>
          </h1>

          <p className="hero-description">
            Take control of your financial life with a simple platform
            designed to track your money, build better habits, achieve
            savings goals and monitor your wealth growth.
          </p>

          <div className="hero-buttons">

            <Link
              to="/register"
              className="primary-button"
            >
              Start Your Journey
              <span className="button-arrow">→</span>
            </Link>

            <a
              href="#features"
              className="secondary-button"
            >
              Explore Features
            </a>

          </div>

          <div className="hero-trust">

            <div className="trust-item">
              <span className="trust-icon">✓</span>
              Easy to use
            </div>

            <div className="trust-item">
              <span className="trust-icon">✓</span>
              Track everything
            </div>

            <div className="trust-item">
              <span className="trust-icon">✓</span>
              Build consistency
            </div>

          </div>

        </div>


        {/* DASHBOARD PREVIEW */}

        <div className="hero-dashboard">

          <div className="dashboard-glow"></div>

          <div className="dashboard-preview">

            <div className="preview-topbar">

              <div className="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="preview-title">
                FinHabit Dashboard
              </div>

              <div className="preview-menu">
                •••
              </div>

            </div>


            <div className="dashboard-header">

              <div>

                <p>Total Net Worth</p>

                <h2>
                  ₹1,24,850
                </h2>

                <div className="net-worth-growth">
                  <span>↗</span>
                  +12.8% this month
                </div>

              </div>

              <div className="growth-badge">
                Growing
              </div>

            </div>


            <div className="dashboard-stats">

              <div className="preview-stat">

                <div className="stat-icon income-icon">
                  ↑
                </div>

                <div>
                  <p>Income</p>
                  <strong>₹45,000</strong>
                </div>

              </div>


              <div className="preview-stat">

                <div className="stat-icon expense-icon">
                  ↓
                </div>

                <div>
                  <p>Expenses</p>
                  <strong>₹28,500</strong>
                </div>

              </div>


              <div className="preview-stat">

                <div className="stat-icon saving-icon">
                  $
                </div>

                <div>
                  <p>Savings</p>
                  <strong>₹16,500</strong>
                </div>

              </div>

            </div>


            <div className="chart-section">

              <div className="chart-heading">

                <div>
                  <p>Wealth Growth</p>
                  <strong>Last 7 Months</strong>
                </div>

                <span>
                  +18.4%
                </span>

              </div>


              <div className="preview-chart">

                <div className="chart-grid-line line-one"></div>
                <div className="chart-grid-line line-two"></div>
                <div className="chart-grid-line line-three"></div>

                <div className="chart-bar bar-1"></div>
                <div className="chart-bar bar-2"></div>
                <div className="chart-bar bar-3"></div>
                <div className="chart-bar bar-4"></div>
                <div className="chart-bar bar-5"></div>
                <div className="chart-bar bar-6"></div>
                <div className="chart-bar bar-7"></div>

              </div>


              <div className="chart-labels">

                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>

              </div>

            </div>


            <div className="habit-preview">

              <div>
                <p>Today's Progress</p>

                <strong>
                  4 of 5 habits completed
                </strong>
              </div>

              <div className="progress-circle">
                80%
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* FEATURES SECTION */}

      <section
        id="features"
        className="features-section"
      >

        <div className="section-heading">

          <div className="section-badge">
            FEATURES
          </div>

          <h2>
            Everything You Need to
            <span> Build Financial Discipline</span>
          </h2>

          <p>
            Manage your daily finances, develop consistent habits
            and visualize your long-term financial progress.
          </p>

        </div>


        <div className="features-grid">


          <div className="feature-card">

            <div className="feature-icon-box">
              ₹
            </div>

            <h3>
              Expense Tracking
            </h3>

            <p>
              Record your income and expenses to understand exactly
              where your money is going.
            </p>

            <div className="feature-link">
              Track your money
            </div>

          </div>


          <div className="feature-card featured-card">

            <div className="feature-icon-box">
              ✓
            </div>

            <h3>
              Financial Habits
            </h3>

            <p>
              Create meaningful financial habits, maintain streaks
              and build consistency over time.
            </p>

            <div className="feature-link">
              Build consistency
            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon-box">
              $
            </div>

            <h3>
              Savings Goals
            </h3>

            <p>
              Set clear savings targets and track your progress
              toward achieving the things that matter.
            </p>

            <div className="feature-link">
              Reach your goals
            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon-box">
              ↗
            </div>

            <h3>
              Wealth Analytics
            </h3>

            <p>
              Monitor your savings, investments, assets and overall
              wealth growth through clear visual insights.
            </p>

            <div className="feature-link">
              See your growth
            </div>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}

      <section
        id="how-it-works"
        className="how-section"
      >

        <div className="section-heading">

          <div className="section-badge">
            HOW IT WORKS
          </div>

          <h2>
            From Small Habits to
            <span> Bigger Financial Goals</span>
          </h2>

          <p>
            FinHabit keeps your financial journey simple,
            visual and consistent.
          </p>

        </div>


        <div className="steps-container">

          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-content">

              <span>
                STEP ONE
              </span>

              <h3>
                Track
              </h3>

              <p>
                Record your income and expenses to understand
                your financial activity.
              </p>

            </div>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-content">

              <span>
                STEP TWO
              </span>

              <h3>
                Build
              </h3>

              <p>
                Create savings goals and financial habits that
                encourage consistent action.
              </p>

            </div>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-content">

              <span>
                STEP THREE
              </span>

              <h3>
                Grow
              </h3>

              <p>
                Monitor your progress and see how your financial
                discipline improves your wealth.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* BENEFITS */}

      <section
        id="benefits"
        className="benefits-section"
      >

        <div className="benefits-wrapper">

          <div className="benefits-content">

            <div className="section-badge">
              WHY FINHABIT
            </div>

            <h2>
              Make Your Financial
              <span> Progress Visible.</span>
            </h2>

            <p>
              Financial improvement becomes easier when you can
              clearly see your habits, goals and wealth moving
              in the right direction.
            </p>

            <Link
              to="/register"
              className="text-button"
            >
              Start Building Today
            </Link>

          </div>


          <div className="benefits-list">


            <div className="benefit-item">

              <div className="benefit-icon">
                01
              </div>

              <div>

                <h3>
                  Understand Your Spending
                </h3>

                <p>
                  Identify spending patterns and understand
                  where your money goes.
                </p>

              </div>

            </div>


            <div className="benefit-item">

              <div className="benefit-icon">
                02
              </div>

              <div>

                <h3>
                  Develop Saving Habits
                </h3>

                <p>
                  Build consistency by tracking your saving
                  activities and financial habits.
                </p>

              </div>

            </div>


            <div className="benefit-item">

              <div className="benefit-icon">
                03
              </div>

              <div>

                <h3>
                  Achieve Financial Goals
                </h3>

                <p>
                  Set meaningful targets and monitor your
                  progress toward achieving them.
                </p>

              </div>

            </div>


            <div className="benefit-item">

              <div className="benefit-icon">
                04
              </div>

              <div>

                <h3>
                  Monitor Wealth Growth
                </h3>

                <p>
                  Visualize how your savings and assets
                  contribute to your overall wealth.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="cta-section">

        <div className="cta-glow"></div>

        <div className="cta-content">

          <div className="cta-small-text">
            YOUR FINANCIAL JOURNEY STARTS HERE
          </div>

          <h2>
            Ready to Take Control
            <br />
            of Your Money?
          </h2>

          <p>
            Start building better financial habits today and
            turn small consistent actions into long-term growth.
          </p>

          <Link
            to="/register"
            className="cta-button"
          >
            Create Your Free Account
          </Link>

        </div>

      </section>


      <Footer />

    </div>
  );
}

export default Home;